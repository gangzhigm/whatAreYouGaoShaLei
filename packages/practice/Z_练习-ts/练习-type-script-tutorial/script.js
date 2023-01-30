"use strict";
// const url: string = 'https://api.thecatapi.com/v1/images/search';
// const button: HTMLButtonElement | null = document.querySelector('button');
// const tableBody: HTMLTableElement | null = document.querySelector('#table-body');
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// interface CatType {
//     id: string;
//     url: string;
//     height: number;
//     width: number;
//     test?: boolean;
// }
// class Cat implements CatType {
//     id: string;
//     url: string;
//     height: number;
//     width: number;
//     constructor(id: string, url: string, height: number, width: number) {
//         this.id = id;
//         this.url = url;
//         this.height = height;
//         this.width = width;
//     }
// }
// class WebDisplay {
//     public static addData(data: CatType): void {
//         const cat: Cat = new Cat(data.id, data.url, data.height, data.width);
//         const tableRow: HTMLTableRowElement = document.createElement('tr');
//         tableRow.innerHTML = `
//             <td>${cat.id}</td>
//             <td><img src="${cat.url}" /></td>
//             <td>${cat.height.toString()}</td>
//             <td>${cat.width.toString()}</td>
//             <td>${cat.url}</td>
//             <td><a href="#">X</a></td>
//         `;
//         tableBody?.appendChild(tableRow);
//     }
//     public static deleteData(deleteButton: HTMLAnchorElement): void {
//         const td = deleteButton.parentElement as HTMLTableCellElement;
//         const tr = td.parentElement as HTMLTableRowElement;
//         tr.remove();
//     }
// }
// async function getJSON<T>(url: string): Promise<T> {
//     const response: Response = await fetch(url);
//     const json: Promise<T> = await response.json();
//     return json;
// }
// async function getData(): Promise<void> {
//     try {
//         const json: CatType[] = await getJSON<CatType[]>(url);
//         const data: CatType = json[0];
//         WebDisplay.addData(data);
//     }
//     catch (error: Error | unknown) {
//         let message: string;
//         if (error instanceof Error) {
//             message = error.message;
//         } else {
//             message = String(error);
//         }
//         console.log(error);
//     }
// }
// button?.addEventListener<'click'>('click', getData);
// tableBody?.addEventListener<'click'>('click', (ev: MouseEvent) => {
//     WebDisplay.deleteData(<HTMLAnchorElement>ev.target);
// });
const url = "https://api.thecatapi.com/v1/images/search";
const button = document.querySelector("button");
const tableBody = document.querySelector("#table-body");
class Cat {
    constructor(id, url, height, width) {
        this.id = id;
        this.url = url;
        this.height = height;
        this.width = width;
    }
}
class WebDisplay {
    static addData(data) {
        const cat = new Cat(data.id, data.url, data.height, data.width);
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = `
            <td>${cat.id}</td>
            <td><img src="${cat.url}" /></td>
            <td>${cat.height.toString()}</td>
            <td>${cat.width.toString()}</td>
            <td>${cat.url}</td>
            <td><a href="#">X</a></td>
        `;
        tableBody === null || tableBody === void 0 ? void 0 : tableBody.appendChild(tableRow);
    }
}
function getJSON(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const json = yield response.json();
        return json;
    });
}
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const json = yield getJSON(url);
            const data = json[0];
            WebDisplay.addData(data);
        }
        catch (error) {
            let message;
            if (error instanceof Error) {
                message = error.message;
            }
            else {
                message = String(error);
            }
            console.info(message);
        }
    });
}
button === null || button === void 0 ? void 0 : button.addEventListener("click", getData);
