//小程序卡片自定义标签
import cardIcon from '../images/icon-miniprogram-green.png';
class mpMiniprogram extends HTMLElement {
    constructor() {
        // 初始化, 更新this指向当前element对象
        super();
        
        /**
         * 创建外部边框
         */
        let divFrame = document.createElement('div');
        divFrame.setAttribute('class', 'mp-frame');
        this.divFrame = divFrame;
        
        /**
         * 创建行,盛放小程序图标和小程序名称
         */
        let mpBasic = document.createElement('div');
        mpBasic.setAttribute('class', 'mp-basic');
        
        /**
         * 创建小程序icon图标
         */
        let mpIcon = document.createElement('img');
        mpIcon.setAttribute('class', 'mp-icon');
        this.mpIcon = mpIcon;
        
        /**
         * 创建小程序名称
         */
        let mpNickname = document.createElement('span');
        mpNickname.setAttribute('class', 'mp-name');
        this.mpNickname = mpNickname;
        
        /**
         * 创建卡片标题
         */
        let mpTitle = document.createElement('div');
        mpTitle.setAttribute('class', 'mp-title');
        this.mpTitle = mpTitle;
        
        /**
         * 创建卡片图片
         */
        let mpImage = document.createElement('img');
        mpImage.setAttribute('class', 'mp-image');
        this.mpImage = mpImage;
        
        /**
         * 创建小程序指引
         */
        let mpGuide = document.createElement('div');
        mpGuide.setAttribute('class', 'mp-guide');
        mpGuide.innerText = '小程序';
        
        /**
         * 组合
         */
        // 小程序basic
        mpBasic.appendChild(mpIcon);
        mpBasic.appendChild(mpNickname);
        
        // 创建shadow
        let shadow = this.attachShadow({ mode: 'closed' });
        // 组合Element
        divFrame.appendChild(mpBasic);
        divFrame.appendChild(mpTitle);
        divFrame.appendChild(mpImage);
        divFrame.appendChild(mpGuide);
        shadow.appendChild(divFrame);
    }
    
    /**
     * 小程序svg图标
     */
    mpIconUrl() {
        return 'data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'%3E  %3Cpath fill=\'%236467F0\' fill-rule=\'evenodd\' d=\'M12.753 9.743l-.177.003c-.535 0-.846-.393-.645-.845a1.16 1.16 0 0 1 .816-.651c.981-.237 1.648-1.004 1.648-1.897 0-1.081-1.032-1.963-2.322-1.963s-2.322.882-2.322 1.963v5.392c0 1.899-1.698 3.428-3.788 3.428s-3.788-1.53-3.788-3.428c0-1.665 1.314-3.087 3.105-3.357h.144c.405 0 .697.243.697.589a.64.64 0 0 1-.008.122.464.464 0 0 1-.044.134c-.13.301-.46.562-.816.651-.974.236-1.648.998-1.648 1.86 0 1.082 1.032 1.964 2.322 1.964s2.322-.882 2.322-1.963V6.353c0-1.899 1.698-3.428 3.788-3.428s3.788 1.53 3.788 3.428c0 1.674-1.283 3.079-3.072 3.39z\'/%3E%3C/svg%3E';
    }
    
    /**
     * 为标签属性添加监听
     */
    static get observedAttributes() {
        return [
            'data-miniprogram-appid',
            'data-miniprogram-path',
            'data-miniprogram-title',
            'data-miniprogram-imageurl'
        ];
    }
    
    /**
     * 标签渲染完成后执行
     */
    connectedCallback() {
        this.divFrame.appendChild(this.style());
        this.mpIcon.src = cardIcon;
        this.mpNickname.innerText = '小程序名称';
        // 判断必填
        if (this.isRequiredError()) {
            return;
        } 
        // 摆放用户传参
        this.mpTitle.innerText = this.title();
        this.mpImage.src = this.imageurl();
    }
    
    /**
     * 判断必填数据
     */
    isRequiredError() {
        let error = '';
        if (!this.appid()) {
            error = 'data-miniprogram-appid is required';
        } else if (!this.path()) {
            error = 'data-miniprogram-path is required';
        } else if (!this.title()) {
            error = 'data-miniprogram-title is required';
        } else if (!this.imageurl()) {
            error = 'data-miniprogram-imageurl is required';
        }
        if (this.appid() && this.path() && this.title() && this.imageurl()) {
            this.dataset.isError = false;
            delete this.dataset.errorMessage;
            return false;
        }
        this.dataset.isError = true;
        this.dataset.errorMessage = error;
        console.error(new Error(error));
        return true;
    }
    
    /**
     * 小程序appid
     */
    appid() {
        return this.dataset.miniprogramAppid;
    }
    
    /**
     * 小程序跳转路径
     */
    path() {
        return this.dataset.miniprogramPath;
    }
    
    /**
     * 卡片标题
     */
    title() {
        return this.dataset.miniprogramTitle;
    }
    
    /**
     * 卡片图片
     */
    imageurl() {
        return this.dataset.miniprogramImageurl;
    }
    
    /**
     * 创建样式, 返回style标签
     */
    style() {
        let style = document.createElement('style');
        style.innerText = `
            .mp-frame {
                width: 100%;
                display: block;
                overflow: visible;
                padding: 12px;
                color: rgba(255,255,255,0.8);
                box-sizing: border-box;
                background-color: #ffffff;
                border: 1px solid #cccccc;
                border-radius: 8px;
            }

            .mp-basic {
                width: 100%;
                display: flex;
                align-items: center;
            }
            .mp-basic .mp-icon {
                width: 20px;
                height: 20px;
                margin-right: 6px;
                border-radius: 50%;
            }
            .mp-basic .mp-name {
                font-size: 14px;
                color: #595959;
            }

            .mp-title {
                font-size: 16px;
                color: #595959;
                padding: 8px 0 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                font-weight: 400;
                box-sizing: border-box;
            }

            .mp-image {
                width: 100%;
                display: block;
            }

            .mp-guide {
                font-size: 14px;
                color: #595959;
                margin-top: 8px;
                display: flex;
                align-items: center;
            }
            .mp-guide:before {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-right: 4px;
                background-image: url("${this.mpIconUrl()}");
                background-size: 100% 100%;
            }
        `.replace(/\n*/g, '');
        return style;
    }
}

export default function createMiniProgram() {
    customElements.define('mp-miniprogram', mpMiniprogram);
}
