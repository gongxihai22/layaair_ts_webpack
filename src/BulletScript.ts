class BulletScript extends Laya.Script {
    /**被绑定的子弹对象**/
    private bullet: Laya.MeshSprite3D;
    /**子弹生命周期**/
    private life: number = 200;
    /**子弹发射的速度（方向）**/
    public speedV3: Laya.Vector3 = new Laya.Vector3();
    /*
    子弹控制脚本
    */
    constructor() {
        super();
    }
    /**
         * 脚本实例化完成载入后调度
         * @param owner 脚本绑定的3D物体
         */
    public _load(owner: Laya.ComponentNode): void {
        //获取子弹与子弹位置
        this.bullet = this.owner as Laya.MeshSprite3D;
    }
    /**
     * 设置子弹射击方向并计算速度
     * @param directionV3
     */
    public setShootDirection(directionV3: Laya.Vector3): void {
        /****
         * 注：
         * 三维向量即是位置、方向，也可以是速度，但速度需要一个统一的参考衡量标准，比如“N*标准速度值/帧”或
         * “N*标准速度值/毫秒”，它类似于“N*米/帧”。
         * 而我们得到的方向向量，它的大小不一，无法作为标准速度值使用，这个时候可用Vector3.normalize()方法
         * 把任一向量归一化，产生单位为一的向量作为标准速度值，再把它进行缩放作为不同物体的速度来使用，比如
         * 0.2倍标准速度值，1.5倍标准速度值等，可使用Vector3.scale()方法缩放。
         ****/
        //将方向向量归一成单位为一的方向速度向量(在LayaAir中相当于1米的长度)
        Laya.Vector3.normalize(directionV3, this.speedV3);
        console.log("\n子弹攻击速度(方向)：", this.speedV3.elements)
        //用缩放方法去调整发射速度，0.2倍标准速度（注：子弹速度过快，可能会越过场景中物品，不发生碰撞！）
        Laya.Vector3.scale(this.speedV3,0.5,this.speedV3);
    }
    /**
     * 脚本帧循环更新
     */
    public _update(state: Laya.RenderState): void {
        //子弹位置更新
        this.bullet.transform.translate(this.speedV3, false);
        //生命周期递减
        this.life--;
        //生命周期结束后，一帧后销毁子弹（目前脚本中直接销毁绑定对象会报错，后期版本解决此问题）
        if (this.life < 0) {
            Laya.timer.frameOnce(3, this, function () { this.bullet.destroy(); });
        }
    }
    /**
     * 当其他碰撞器进入绑定物体碰撞器时触发（子弹击中物品时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerEnter(other: Laya.Collider): void {
    }
    /**
     * 当其他碰撞器进入绑定物体碰撞器后逐帧触发（子弹进入物品时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerStay(other: Laya.Collider): void {
        console.log('onTriggerStay...');
    }
    /**
     * 当其他碰撞器退出绑定物体碰撞器时逐帧触发（子弹穿出物品时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerExit(other: Laya.Collider): void {
        //一帧后销毁子弹（目前脚本中直接销毁绑定对象会报错，后期版本解决此问题）
        Laya.timer.frameOnce(1, this,function(){ this.bullet.destroy() });
    }
}

export default BulletScript;