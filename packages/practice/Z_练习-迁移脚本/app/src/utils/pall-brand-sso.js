/**
 * 
 * @param {string} pallUrl outlook表单url 
 * @param {string} SAMLRequest outlook表单value
 * @description 【Pall中国】用户专用outlook单点登录逻辑，通过创建dom表单虚拟提交，自动跳转outlook登陆页
 */
export async function RenderPallForm ({ pallUrl, SAMLRequest }) {
    let tempform = document.createElement('form');
    tempform.action = pallUrl;
    tempform.method = 'post';
    tempform.style.display = 'none';

    let opt = document.createElement('input');
    opt.name = 'SAMLRequest';
    opt.type = 'hidden';
    opt.value = SAMLRequest;
    tempform.appendChild(opt);

    let btn = document.createElement('input');
    btn.type = 'submit';
    btn.value = 'Continue';
    tempform.appendChild(btn);

    document.body.appendChild(tempform);
    tempform.submit();
    document.body.removeChild(tempform);
}