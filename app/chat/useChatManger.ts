'use client'
import {useState, useEffect, useRef} from 'react';

export const useChatManger = () => {
    const [messages, setMessages] = useState<{ content: string, role: string }[]>([]);
    // 角色 A 的提示词
    const [roleAPrompt, setRoleAPrompt] = useState<string>(`
    `);
    // 角色 B 的提示词
    const [roleBPrompt, setRoleBPrompt] = useState<string>('');

    // 表单字段列表
    const [formFields, setFormFields] = useState<any>({});
    // 角色 C 的提示词
    const getRoleCPrompt = (userInput: string) => {
        return `
        [背景设定]
        这是一个通过对话方式向用户收集表单的系统，通过一问一答的方式向用户提问收集表单信息。
        你需要根据已知的表单字段列表和要求，并结合用户已经填写的表单字段逐一向用户发起询问(输出提问)
        输出时需要按照输出要求执行，不要做任何解释。
        如果所有表单字段都已经收集完成，则输出固定字符"done"
        [表单字段]
        - 姓名
        - 年龄
        - 性别
        - 职业
        [表单规则]
        - 如果年龄大于 30，则要求填写职业，否则跳过职业字段
        
        [已知的表单字段，json 格式，可能为空]
        ${JSON.stringify(formFields)}
        用户最后输入的信息：
        ${userInput}
        
        [输出提问示例]
        1.好的我已经知道您多大了，现在请告诉我您的性别是什么？
        2.嗯，我已经知道您的性别了，现在请告诉我您的职业是什么？
        
        [输出要求]
         1.不要解释，直接输出提问
         2.一次只输出一个提问，不要一次性将所有问题都输出
         3.直到所有字段的提问都已经输出完成（跳过的字段不计算），则输出固定字符"done"
         4.涉及到表单规则时不需要解释，直接按规则执行输出
         5.不要输出序号如:1.
         6.不要输出根据 xxx规则类似的话术
   `
    }
    const getRoleBPrompt = (roleAQuestion: string, userInput: string) => {
        return `
            [背景]
            基于给定的表单字段和已收集的表单信息、提问内容、用户的回答，判断用户最后输入的信息是否有匹配到表单字段
            输出时需要按照输出要求执行，不要做任何解释和说明，直接输出json数据。
            [已知表单字段]：
             - 姓名
            - 年龄
            - 性别
            - 职业(如果年龄大于 30岁需要用户填写，否则跳过)
            [已收集的表单信息]
                ${JSON.stringify(formFields)}
                
            [提问内容]：${roleAQuestion}
            [用户回答]：${userInput}
            [执行规则]
            1.请根据以上信息判断用户最后输入的信息是否有匹配到表单字段
            2.如果有匹配到表单字段，请使用 json格式输出匹配到的表单字段和用户输入的信息
            [返回数据格式]
            {
                "姓名":"张三",
                "年龄": 18
            }
           [输出要求]
            1.如果没有输出 json格式的空对象：{}
            2.不要做任何解释，直接输出json 即可。
            3.直接输出 json数据，不要使用\`这种符号标识
        `
    }
    // 用户输入消息后，角色 A开始回复 ，角色 C 先生成提示词
    const chat = async (userInput: string) => {
        if (userInput !== '') {
            setMessages([...messages, {content: userInput, role: 'user'}]);
        }
        // 先添加一个新的AI响应到messages
        setMessages(messages => [...messages, {content: '正在获取回答...', role: 'bot'}]);
        const promptC = getRoleCPrompt(userInput);
        console.log("promptC提示词", promptC)
        const aiQuestion = await getAIResponse(promptC);
        if (userInput !== '') {
            // 取上一个ai消息的提问
           const assistantMessage =  messages.filter((it)=>it.role==='assistant')
           const lastMsg = assistantMessage[assistantMessage.length-1]
            const promptB = getRoleBPrompt(lastMsg.content, userInput);
            console.log("promptB提示词", promptC)
            const formResult = await getAIResponse(promptB,false);
            for (const [key, value] of Object.entries(JSON.parse(formResult))) {
                setFormFields((prevFormFields: any) => {
                    const newFormFields = {...prevFormFields};
                    newFormFields[key] = value;
                    return newFormFields;
                });
            }
            console.log("formResult", formResult)
        }
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1] = {content: aiQuestion, role: 'assistant'};
            return newMessages;
        });

    }
    const getAIResponse = async (userInput: string,useHistory:boolean = true) => {
        const input:any = {message: userInput}
        if(useHistory){
            input["history"] = messages
        }
        const res = await fetch('/api/tongyi/chat', {
            method: 'POST', // Assuming it's a POST request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });
        const data = await res.json();
        return `${data}`;
    };

    return {
        chat,
        messages
    }
}