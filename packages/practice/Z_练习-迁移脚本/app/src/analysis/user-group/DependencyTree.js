/**
 * 根据所有的用户分群引用信息，生成一个依赖树
 */

import uniq from 'lodash/uniq';
import {logError} from '../../monitor';

const GROUP_KEY_MATCHER = /group_(\d+)/g;

export function getDepIds(str) {
    const ids = [];
    let match = [];
    while (match) {
        match = GROUP_KEY_MATCHER.exec(str);
        if (!match) break;
        ids.push(match[1]);
    }
    return ids.map(Number);
}

/**
 * 创建一个节点
 * @param {Number} id
 * @param {Array<Number>} subordinateIds
 * @constructor
 */
export class TreeNode {
    
    constructor(id, subordinateIds) {
        this.id = id;
        this.subordinates = subordinateIds; // 直接依赖的所有节点
        this.subIds = [];       // 所有依赖的节点
        this.superiors = [];    // 以当前节点为直接依赖的所有节点
    }
    
    necessary() {
        return !!this.superiors.length;
    }
    
    dependsOn(id) {
        return this.subIds.some(sub => sub === id);
    }
    
}


/**
 *
 * @param {TreeNode|Number} nodeOrId
 * @param {Array<Number>} acc
 * @param restNodes
 * @param rootId
 * @return {*}
 */
function mapIds(nodeOrId, acc, restNodes, rootId) {
    /*eslint-disable-next-line*/
    const node = typeof nodeOrId === 'number' ? groupDependencyTree.getNode(nodeOrId) : nodeOrId;
    if (rootId === node.id) {
        acc.push(node.id);
        logError(`[数据分析-用户分群] DependencyTree.js mapIds 用户分群循环引用自身 ${rootId}`);
        return acc;
    }
    acc.push(node.id);
    
    if (node.subordinates.length === 0) {
        if (restNodes.length === 0) {
            return acc;
        }
        return mapIds(restNodes[0], acc, restNodes.slice(1), rootId);
    }
    return mapIds(node.subordinates[0], acc, restNodes.concat(node.subordinates.slice(1)), rootId);
}


/**
 * 依赖树构造类
 */
class DependencyTree {
    
    constructor() {
        
        /**
         * id:TreeNode 键值map
         * @type {{Number, TreeNode}}
         * @private
         */
        this._nodeMap = {
            // userGroup.id: treeNode
        };
        
        
    }
    
    
    /**
     * 返回树中的一个节点
     * @param {Number|String} id
     * @return {TreeNode}
     */
    getNode(id) {
        return this._nodeMap[id];
    }
    
    
    /**
     * 消化现有所有节点信息
     * @private
     */
    digest() {
        for (let node of Object.values(this._nodeMap)) {
            node.superiors = [];
            node.subordinates = node.subordinates
                .filter(sub => {
                    if (typeof sub === 'number') {
                        if (sub === node.id) {
                            logError(`[数据分析-用户分群] DependencyTree.js digest ID为 ${node.id} 的分群依赖了自身`);
                            return false;
                        }
                        if (!this._nodeMap[sub]) {
                            logError(`[数据分析-用户分群] DependencyTree.js digest ID为 ${node.id} 的分群依赖了一个不存在的分群：${node.id}`);
                            return false;
                        }
                        return true;
                    }
                    return sub;
                })
                .map(sub => {
                    if (typeof sub === 'number') {
                        let subNode = this._nodeMap[sub];
                        let index = subNode.superiors
                            .findIndex(superior => (superior === node.id || superior === node.id));
                        index === -1 ? subNode.superiors.push(node) : subNode.superiors.splice(index, 1, node);
                        return subNode;
                    }
                    return sub;
                });
            node.subIds = node.subordinates.length
                ? uniq(mapIds(node.subordinates[0], [], node.subordinates.slice(1), node.id))
                : [];
        }
    }
    
    
    /**
     * 增加一个节点
     * @param {TreeNode} node
     */
    feed(node) {
        this._nodeMap[node.id] = node;
    }
    
    
    /**
     * 更新一个节点
     * @param {Number} id
     * @param {Array<Number>} subordinateIds
     */
    update(id, subordinateIds) {
        const node = this._nodeMap[id];
        // 更新子节点列表
        node.subordinates = subordinateIds;
        this.digest();
    }
    
    
    /**
     * 删除掉一个节点
     * @param {Number} nodeId
     */
    drop(nodeId) {
        const node = this._nodeMap[nodeId];
        if (node) {
            // 更新父节点的子节点列表
            node.superiors.forEach(sup => {
                const idx = sup.subordinates.findIndex(sub => sub === node || sub === nodeId);
                if (idx !== -1) {
                    sup.subordinates.splice(idx, 1);
                }
            });
            this.digest();
            delete this._nodeMap[nodeId];
        }
    }
    
    
    /**
     * 清空所有节点
     */
    destroy() {
        for (const id in this._nodeMap) {
            delete this._nodeMap[id];
        }
    }
    
}

const groupDependencyTree = new DependencyTree();
export default groupDependencyTree;
