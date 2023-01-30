"use strict";
/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_po_1 = require("./app.po");
const protractor_1 = require("protractor");
describe('workspace-project App', () => {
    let page;
    beforeEach(() => {
        page = new app_po_1.AppPage();
    });
    it('should display welcome message', () => {
        page.navigateTo();
        expect(page.getTitleText()).toEqual('playground app is running!');
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Assert that there are no errors emitted from the browser
        const logs = yield protractor_1.browser.manage().logs().get(protractor_1.logging.Type.BROWSER);
        expect(logs).not.toContain(jasmine.objectContaining({
            level: protractor_1.logging.Level.SEVERE,
        }));
    }));
});
