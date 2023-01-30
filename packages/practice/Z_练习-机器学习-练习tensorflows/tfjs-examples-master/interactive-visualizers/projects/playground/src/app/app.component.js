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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
const core_1 = require("@angular/core");
const environment_1 = require("./../environments/environment");
let AppComponent = class AppComponent {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.title = 'playground';
        this.interactiveVisualizerUrl = environment_1.environment.interactiveVisualizerUrl;
        this.models = environment_1.environment.models;
        this.embedUrl = null;
    }
    selectModel(index) {
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.interactiveVisualizerUrl +
            '?modelMetadataUrl=' + this.models[index].metadataUrl);
    }
};
AppComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss']
    })
], AppComponent);
exports.AppComponent = AppComponent;
