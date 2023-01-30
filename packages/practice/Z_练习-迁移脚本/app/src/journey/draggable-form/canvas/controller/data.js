/**
 * Created by chutt on 2017/8/9.
 */

export function filterHTML(html) {
    // remove action buttons
    html = html.replace(/<div class="(block|content)-operations">((?!<\/div)(.|\n))+<\/div>/ig, '');
    // stripe classes and id
    html = html.replace(/class="[-_a-zA-Z0-9\s]*"\s*/ig, '');
    html = html.replace(/id="[-_a-zA-Z0-9\s]*"\s*/ig, '');
    //data-type
    /* eslint no-control-regex: 0*/
    html = html.replace(/data-type="[^\x0000-\u00FF]*"\s*/ig, '');
    html = html.replace(/data-title="[\s\S]*?<\/a>"\s*/ig, '');
    html = html.replace(/data-title-direction="(bottom|top)?"\s*/ig, '');
    html = html.replace(/data-line="(true|false)?"\s*/ig, '');
    // stripe draggable attributes
    html = html.replace(/draggable="(false|true)?"\s*/ig, '');
    // &quote;
    html = html.replace(/&quot;/ig, '');
    html = html.replace(/\\n/ig, '');
    html = html.replace(/\\/ig, '');
    html = html.replace(/&uml;/ig, '');
    return html;
    // return `<!DOCTYPE html><html lang="zh-CN"><head><meta http-equiv="x-ua-compatible" content="ie=edge, chrome=1"><meta charset="UTF-8"><meta name="renderer" content="webkit"><meta name="author" content="WebpowerChina"><link rel="WebpowerChina" href="mailto:market@webpowerchina.com"></head><body>${html}</body><style>a{text-decoration:none;}a:link{text-decoration:none;}a:hover{text-decoration:none;}a:active{text-decoration:none;}</style></html>`;
}

let handle = null;

/**
 * 导出数据：导出为JSON，导出为HTML
 * @param content   内容
 * @param name      名称
 * @return {*}
 */
export function exportData(content, name) {
    const contentString = typeof content === 'string' ? filterHTML(content) : JSON.stringify(content);
    const file = /\.json$/i.test(name)
        ? new File([contentString], {type: 'application/json'})
        : new File([contentString], {type: 'text/html'});
    
    if (handle !== null) window.URL.revokeObjectURL(handle);
    handle = window.URL.createObjectURL(file);
    const aLink = document.createElement('a');
    aLink.download = name;
    aLink.href = handle;
    const evObj = new MouseEvent('click');
    aLink.dispatchEvent(evObj);
}
