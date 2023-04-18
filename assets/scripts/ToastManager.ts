import ToastBase from "./component/Toast/ToastBase";
import {_decorator,find, resources, Node,instantiate,Canvas,macro,  Prefab, isValid, warn} from 'cc'
import {Game} from "./Game";
const { ccclass, property } = _decorator;

/** Toast缓存模式 */
export enum ToastCacheMode {
    /** 一次性的（立即销毁节点，预制体资源随即释放） */
    Once = 1,
    /** 正常的（立即销毁节点，但是缓存预制体资源） */
    Normal,
    /** 频繁的（只关闭节点，且缓存预制体资源） */
    Frequent
}

/** Toast请求结果 */
enum ShowResult {
    /** 展示成功（已关闭） */
    Done = 1,
    /** 展示失败（加载失败） */
    Failed,
    /** 等待中（已加入等待队列） */
    Waiting
}

/**
 * Toast管理器
 */
export default class ToastManager {

    /** 预制体缓存 */
    public static get prefabCache() { return this._prefabCache; }
    private static _prefabCache: Map<string, Prefab> = new Map<string, Prefab>();

    /** 当前展示队列 */
    public static get currentShowToast() {return this._currentShowToast}
    public static _currentShowToast: Map<string,ToastRequestType> = new Map<string, ToastRequestType>()

    /** 锁定状态 */
    private static locked: boolean = false;

    /** 用于存放Toast节点的容器节点（不设置则默认为当前 Canvas） */
        // @ts-ignore
    public static container: Node = null;

    /** 连续展示Toast的时间间隔（秒） */
    public static interval: number = 0.05;

    /** Toast缓存模式 */
    public static get CacheMode() {
        return ToastCacheMode;
    }

    /** Toast请求结果类型 */
    public static get ShowResult() {
        return ShowResult;
    }

    /**
     * Toast动态加载开始回调
     * @example
     * PopupManager.loadStartCallback = () => {
     *     LoadingTip.show();
     * };
     */
        // @ts-ignore
    public static loadStartCallback: () => void = null;

    /**
     * Toast动态加载结束回调
     * @example
     * PopupManager.loadFinishCallback = () => {
     *     LoadingTip.hide();
     * };
     */
        // @ts-ignore
    public static loadFinishCallback: () => void = null;

    /**
     * 展示Toast，如果当前已有Toast在展示中则加入等待队列
     * @param path Toast预制体相对路径（如：prefabs/MyPopup）
     * @param id toast id
     * @param options Toast选项（将传递给Toast的组件）
     * @param params Toast展示参数
     * @example
     * const options = {
     *     title: 'Hello',
     *     content: 'This is a popup!'
     * };
     * const params = {
     *     mode: PopupCacheMode.Normal
     * };
     * PopupManager.show('prefabs/MyPopup', options, params);
     */
    public static show<Options>(path: string, id: string, options?: Options, params?: ToastParamsType): Promise<ShowResult> {
        return new Promise(async res => {
            // 解析处理参数
            // @ts-ignore
            params = this.parseParams(params);
            // 先在缓存中获取Toast节点
            let node = this.getNodeFromCache(path);
            // 缓存中没有，动态加载预制体资源
            if (!isValid(node)) {
                // 开始回调
                this.loadStartCallback && this.loadStartCallback();
                // 等待加载
                const prefab = await this.load(path);
                // 完成回调
                this.loadFinishCallback && this.loadFinishCallback();
                // 加载失败（一般是路径错误导致的）
                if (!isValid(prefab)) {
                    warn('[ToastManager]', 'Toast加载失败', path);
                    // @ts-ignore
                    this._current = null;
                    res(ShowResult.Failed);
                    return;
                }
                // 实例化节点
                node = instantiate(prefab);
            }
            // 获取继承自 PopupBase 的Toast组件
            const toast = node.getComponent(ToastBase);
            if (!toast) {
                warn('[ToastManager]', '未找到Toast组件', path);
                res(ShowResult.Failed);
                return;
            }
            // 添加到场景中
            node.setParent(this.container || find("Canvas"));
            // 显示在最上层
            node.setSiblingIndex(1);
            // 设置完成回调
            const finishCallback = async () => {
                // 回收
                // @ts-ignore
                this.recycle(path, node, params.mode);
                // @ts-ignore
                res(ShowResult.Done);
                // 延迟一会儿
                await new Promise(_res => {
                    find("Canvas")!.getComponent(Game)!.scheduleOnce(_res, this.interval);
                });
                // 移除当前Toast，移动剩余toast上移
                this._currentShowToast.delete(id)
                this.moveToast()
            }
            toast.setFinishCallback(finishCallback);
            // toast 添加到正在展示的列表
            let showToast: ToastRequestType = {
                path: path,
                options: options,
                params: params,
                toast: toast,
                node: node
            }
            // 先展示
            toast.show(options, this._currentShowToast.size);
            // 判断是否有相同id toast，删除旧toast
            let deleteToastLocationIndex = -1
            if (this._currentShowToast.size != 0) {
                if (this._currentShowToast.has(id)){
                    // 关闭对应Toast
                    let oldToast = this._currentShowToast.get(id)!
                    oldToast.toast!.hide()
                    deleteToastLocationIndex = oldToast.toast!.locationIndex
                    this._currentShowToast.delete(id)
                }
            }
            this._currentShowToast.set(id, showToast)
            // 移动toast
            this.moveToast()
        });
    }

    /**
     *  移动toast
     */
    public static moveToast(){
        let index = 0
        this._currentShowToast.forEach(value => {
            value.toast!.move(index)
        })
    }


    /**
     * 隐藏指定Toast
     */
    public static hide(ToastID: string) {
        if (this._currentShowToast.has(ToastID)){
            this._currentShowToast.get(ToastID)!.toast!.hide()
        }
    }

    /**
     * 从缓存中获取节点
     * @param path Toast路径
     */
    private static getNodeFromCache(path: string): Node {
        // 从预制体缓存中获取
        const prefabCache = this._prefabCache;
        if (prefabCache.has(path)) {
            const prefab = prefabCache.get(path);
            if (isValid(prefab)) {
                // 增加引用计数
                // @ts-ignore
                prefab.addRef();
                // 实例化并返回
                // @ts-ignore
                return instantiate(prefab);
            }
            // 删除无效引用
            prefabCache.delete(path);
        }
        // 无
        // @ts-ignore
        return null;
    }

    /**
     * 加载并缓存Toast预制体资源
     * @param path Toast路径
     */
    public static load(path: string): Promise<Prefab> {
        return new Promise(res => {
            const prefabMap = this._prefabCache;
            // 先看下缓存里有没有，避免重复加载
            if (prefabMap.has(path)) {
                const prefab = prefabMap.get(path);
                // 缓存是否有效
                if (isValid(prefab)) {
                    // @ts-ignore
                    res(prefab);
                    return;
                } else {
                    // 删除无效引用
                    prefabMap.delete(path);
                }
            }
            //动态加载
            resources.load(path, Prefab, (error, prefab) => {
                if (error) {
                    // @ts-ignore
                    res(null);
                    return;
                }
                // 缓存预制体
                prefabMap.set(path, prefab);
                // 返回
                res(prefab);
            });
        });
    }

    /**
     * 尝试释放Toast资源（注意：Toast内部动态加载的资源请自行释放）
     * @param path Toast路径
     */
    public static release(path: string) {
        // 移除预制体
        const prefabCache = this._prefabCache;
        let prefab = prefabCache.get(path);
        if (prefab) {
            // 删除缓存
            if (prefab.refCount <= 1) {
                prefabCache.delete(path);
            }
            // 减少引用
            prefab.decRef();
            prefab = undefined;
        }
    }

    /**
     * 解析参数
     * @param params 参数
     */
    private static parseParams(params: ToastParamsType) {
        if (params == undefined) {
            return new ToastParamsType();
        }
        // 是否为对象
        if (Object.prototype.toString.call(params) !== '[object Object]') {
            warn('[PopupManager]', 'Toast参数无效，使用默认参数');
            return new ToastParamsType();
        }
        // 缓存模式
        if (params.mode == undefined) {
            params.mode = ToastCacheMode.Normal;
        }
        // 优先级
        if (params.priority == undefined) {
            params.priority = 0;
        }

        return params;
    }

}

/** Toast展示参数 */
export class ToastParamsType {
    /** 缓存模式 */
    mode?: ToastCacheMode = ToastCacheMode.Normal;
    /** 优先级（优先级大的优先展示） */
    priority?: number = 0;
}

/** Toast展示请求 */
class ToastRequestType {
    /** Toast预制体相对路径 */
    path: string | undefined;
    /** Toast选项 */
    options: any;
    /** 缓存模式 */
    params: ToastParamsType | undefined;
    /** Toast组件 */
    toast: ToastBase | undefined;
    /** Toast节点 */
    node?: Node;
}