import BulletScript from './BulletScript';
import CubeScript from './CubeScript';


class Main {
    private camera: Laya.Camera;
    private scene: Laya.Scene;
    private mousePos: Laya.Vector2 = new Laya.Vector2();
    private ray: Laya.Ray = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
    private rayCastHit: Laya.RaycastHit = new Laya.RaycastHit();
    private bullet: Laya.MeshSprite3D;
    private box: Laya.MeshSprite3D;

    constructor() {
        Laya3D.init(0, 0, true);
        Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        Laya.Stat.show();

        var scene: Laya.Scene = Laya.stage.addChild(new Laya.Scene()) as Laya.Scene;
        this.scene = scene;
        var camera: Laya.Camera = scene.addChild(new Laya.Camera()) as Laya.Camera;
        this.camera = camera;
        camera.transform.position=new Laya.Vector3(0, 3, 10);
        camera.transform.rotate(new Laya.Vector3( -17, 0, 0), true, false);

        // 创建子弹 - 球形
        this.bullet = scene.addChild(new Laya.MeshSprite3D(new Laya.SphereMesh(1, 6, 6))) as Laya.MeshSprite3D;
        this.bullet.transform.translate(new Laya.Vector3(-3, 0, 5), false);
        var material: Laya.StandardMaterial = new Laya.StandardMaterial();
        material.diffuseTexture = Laya.Texture2D.load("static/res/threeDimen/layabox.png");
        this.bullet.meshRender.material = material;
        var sphereCollider = this.bullet.addComponent(Laya.SphereCollider) as Laya.SphereCollider;
        sphereCollider.center = this.bullet.meshFilter.sharedMesh.boundingSphere.center.clone();
        sphereCollider.radius = this.bullet.meshFilter.sharedMesh.boundingSphere.radius;
        this.bullet.addComponent(Laya.Rigidbody);
        this.bullet.removeSelf();

        // 创建盒子
        this.box = scene.addChild(new Laya.MeshSprite3D(new Laya.BoxMesh(2, 2, 2))) as Laya.MeshSprite3D;
        this.box.transform.translate(new Laya.Vector3(1, 0, -8), false);
        this.box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
        var cubeMaterial: Laya.StandardMaterial = new Laya.StandardMaterial();
        cubeMaterial.diffuseTexture = Laya.Texture2D.load("static/res/threeDimen/layabox.png");
        this.box.meshRender.material = cubeMaterial;
        var boxCollider:Laya.BoxCollider = this.box.addComponent(Laya.BoxCollider) as Laya.BoxCollider;
        boxCollider.setFromBoundBox(this.box.meshFilter.sharedMesh.boundingBox);
        this.box.addComponent(CubeScript);

        // 鼠标控制创建子弹发射
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onShoot);
    }

    private onShoot(): void {
        console.log('onShoot...');
        //克隆一颗子弹用于射击
        var bulletClone: Laya.MeshSprite3D = this.bullet.clone();
        //为子弹加控制脚本
        var script: BulletScript = bulletClone.addComponent(BulletScript) as BulletScript;
        this.scene.addChild(bulletClone);

        //鼠标点击屏幕的位置
        this.mousePos = new Laya.Vector2(Laya.MouseManager.instance.mouseX, Laya.MouseManager.instance.mouseY);
        //鼠标点击屏幕产生射线
        this.camera.viewportPointToRay(this.mousePos, this.ray);
        //射线与3D模型中的碰撞器进行碰撞检测
        Laya.Physics.rayCast(this.ray, this.rayCastHit, 30, 0);

         //-----------在子弹脚本中设置子弹发射方向----------------------
        //射击的方向向量
        var dirV3: Laya.Vector3 = new Laya.Vector3();
        //如果鼠标点击到模型上（射线与碰撞器发生碰撞）
        if (this.rayCastHit.distance !== -1) {
            //子弹射击方向向量 = 由鼠标点中的目标位置向量 —— 子弹起始位置向量
            Laya.Vector3.subtract(this.rayCastHit.position, this.bullet.transform.position, dirV3);
            //设置子弹控制脚本中发射方向
            script.setShootDirection(dirV3);
        } else {//如果鼠标未点击到模型上
            /**
             *射线方向向量是归一化的单位向量，不能直接用于向量加减。需要根据射线产生的原理算
             *出相当于有长短距离的方向向量用于计算，可以通过向量缩放方法实现。
             *射线原理：原点是鼠标点击在近裁剪面上的点,方向是从摄像机位置到鼠标点击在远裁剪面
             *上的点产生的归一化方向。因此可以用摄像机到远裁面的距离模拟原始方向向量        
             **/
            // console.log(Laya.Vector3.scalarLength(this.ray.direction));
            //摄像机到鼠标点击处的方向向量
            var aV3: Laya.Vector3 = new Laya.Vector3();
            //根据射线方向向量、摄像机远裁剪值缩放为射线方向原始向量(使用远裁距会有一点误差，但不影响效果)
            Laya.Vector3.scale(this.ray.direction, this.camera.farPlane, aV3);
            //根据摄像机与子弹的位置求出子弹到摄像机的方向向量
            var bV3: Laya.Vector3 = new Laya.Vector3();
            Laya.Vector3.subtract(this.camera.transform.position, this.bullet.transform.position, bV3);
            //射击的方向向量 = 摄像机到鼠标点击处的方向向量 +子弹到摄像机的方向向量
            Laya.Vector3.add(aV3, bV3, dirV3);
            //设置子弹控制脚本中发射方向
            script.setShootDirection(dirV3);
        }
    }
}

new Main();