/**
 * 下载csv文件
 * @param {String} method
 * @param {String} name
 * @param {String} value
 * @param {String} url
 */
export default function (method, name, value, url) {
    let dlform = document.createElement('form');
    dlform.style = 'display:none;';
    dlform.method = method;
    dlform.action = url;
    dlform.target = '_blank';
    dlform.rel = 'noopener';
    let hdnFilePath = document.createElement('input');
    hdnFilePath.type = 'text';
    hdnFilePath.name = name;
    hdnFilePath.value = value;
    dlform.appendChild(hdnFilePath);
    document.body.appendChild(dlform);
    dlform.submit();
    document.body.removeChild(dlform);
}


let handle = null;

/**
 * 异步下载文件，检测 {code,data,message} 格式的异常返回
 * @param {String} filename
 * @param {ArrayBuffer} arrayBuffer
 * @param {String} MIMEType
 * @return {Promise<any>}
 */
export function downloadArrayBufferAsFile(filename, arrayBuffer, MIMEType = 'text/plain') {
    return new Promise((resolve, reject) => {
        try {
            const u8Arr = new Uint8Array(arrayBuffer);
            const blob = new Blob([u8Arr], {type: MIMEType});
            let textString = '';
            
            if ('TextDecoder' in window) {
                textString = (new TextDecoder()).decode(arrayBuffer);
            } else {
                textString = String.fromCharCode.apply(null, u8Arr);
            }
            
            let code = /"code"\s*:\s*(\d*)/.exec(textString);
            if (code && code.length && code[1] && parseInt(code[1]) !== 200) {
                if ('TextDecoder' in window) {
                    let res = JSON.parse(textString);
                    reject(res.message);
                } else {
                    reject('');
                }
                return;
            }
            
            // IE doesn't allow using a blob object directly as link href
            // instead it is necessary to use msSaveOrOpenBlob
            // https://blog.jayway.com/2017/07/13/open-pdf-downloaded-api-javascript/
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob);
                return;
            }
            let aLink = document.createElement('a');
            let evObj = new MouseEvent('click');

            if (handle !== null) window.URL.revokeObjectURL(handle);
            handle = window.URL.createObjectURL(blob);

            aLink.download = filename;
            aLink.href = handle;
            aLink.dispatchEvent(evObj);
    
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

