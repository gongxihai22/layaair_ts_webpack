import BulletScript from './BulletScript';

class CubeScript extends Laya.Script {
    /**被绑定的立方体对象**/
    public cube: Laya.MeshSprite3D;
    /**是否被攻击**/
    private isAttacked: Boolean = false;
    /**盒子被击退的标准速度（方向）**/
    public repelledV3: Laya.Vector3 = new Laya.Vector3();
    /**盒子生命周期**/
    public life: number = 60;
    /**
     * 立体体盒子控制脚本
     */
    constructor() {
        super();
    }
    /**
         * 脚本实例化完成载入后调度
         * @param owner 脚本绑定的3D物体
         */
    public _load(owner: Laya.ComponentNode): void {
        //获取被绑定对象
        this.cube = this.owner as Laya.MeshSprite3D;
    }
    /**
     * 当其他碰撞器进入绑定物体碰撞器时触发（子弹击中盒子时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerEnter(other: Laya.Collider): void {
        //获取其他碰撞器绑定的模型
        var sp3D: Laya.MeshSprite3D = other.owner as Laya.MeshSprite3D;
        //获取子弹对象模型脚本
        var script: BulletScript = sp3D.getComponentByType(BulletScript) as BulletScript;
        //获取子弹速度为
        this.repelledV3 = script.speedV3.clone();
        //被攻击速度归一化成单位一向量
        Laya.Vector3.normalize(this.repelledV3, this.repelledV3);
        //设置为被攻击状态
        this.isAttacked = true;
        console.log("\n1 子弹碰撞时位置(方向):", sp3D.transform.position.elements);
    }
    /**
     * 当其他碰撞器进入绑定物体碰撞器后逐帧触发（子弹进入盒子时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerStay(other: Laya.Collider): void {
        var sp3D: Laya.MeshSprite3D = other.owner as Laya.MeshSprite3D;
        console.log("2 子弹穿过时位置(方向):", sp3D.transform.position.elements);
    }
    /**
     * 当其他碰撞器退出绑定物体碰撞器时逐帧触发（子弹穿出盒子时）
     * 注：如相对移动速度过快，可能直接越过
     */
    public onTriggerExit(other: Laya.Collider): void {
        //获取其他碰撞器绑定的模型
        var sp3D: Laya.MeshSprite3D = other.owner as Laya.MeshSprite3D;
        console.log("3 子弹穿出时位置(方向):", sp3D.transform.position.elements);
        //击中后生命减，为0时一帧后销毁（目前脚本中直接销毁绑定对象会报错，后期版本解决此问题）
        this.life -= 10;
        if (this.life <= 0) {
            this.enable = false;
            Laya.timer.frameOnce(1, this, function () { this.owner.destroy() });
        }
    }
    /**
     * 脚本的帧循环
     */
    public _update(state: Laya.RenderState): void {
        //被攻击状态下，盒子产生击退效果
        if (this.isAttacked) {
            //根据击退方向和速度移动
            this.cube.transform.translate(this.repelledV3, false);
            // console.log("击退位置变化：",(this.cube.transform.position.clone() as Laya.Vector3).elements);
            //击退速度逐步减小
            Laya.Vector3.scale(this.repelledV3, 0.3, this.repelledV3);
            //当后退各方向速度小于0.01时，击退状态停止
            if (Laya.Vector3.scalarLength(this.repelledV3) < 0.01) {
                this.isAttacked = false;
            }
        }
    }
}

export default CubeScript;