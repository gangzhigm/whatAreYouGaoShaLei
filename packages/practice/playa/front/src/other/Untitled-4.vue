    
  //   // 设置路径辅助 地板
  //   const floor_list = [];
  //   const maplist = [];
  //   const floor_size = [unit_size, 1, unit_size];
  //   const floor_color = getColor();
  //   const floor_Scale = [1,10];
  //   createFloor()
  //   function createFloor(){
  //     const geometry = new THREE.BoxGeometry( ...floor_size );
    

  //     // // 全随机算法
  //     // for(let i = (-(map_size/2) + unit_size/2); i <= map_size/2; i+=unit_size){
  //     //   for(let j = (-(map_size/2) + unit_size/2); j <= map_size/2; j+=unit_size){
  //     //     let coefficient = Math.random() 
  //     //     const scale_Coefficient = Number((coefficient*(floor_Scale[1] - floor_Scale[0]) + floor_Scale[0]).toFixed(1));
  //     //     const y_axis = floor_size[1]*scale_Coefficient / 2;
  //     //     let color = floor_color
  //     //     if (scale_Coefficient <= 10) color = "#000000";
  //     //     if (scale_Coefficient <= 7.5) color = "#ffff00";
  //     //     if (scale_Coefficient <= 5) color = "#00ff00";
  //     //     if (scale_Coefficient <= 2.5) color = "#00ffff";
  //     //     const material = new THREE.MeshStandardMaterial({color});
  //     //     const cube = new THREE.Mesh( geometry, material );
  //     //     cube.scale.y = scale_Coefficient;
  //     //     cube.position.set(i,y_axis,j)
  //     //     scene.add( cube );
  //     //     floor_list.push(cube)
  //     //     maplist.push([i,j])
  //     //   } 
  //     // }
      
  //     // 一维 value_noise算法
  //     for(let i = (-(map_size/2) + unit_size/2); i <= map_size/2; i+=unit_size){
  //       const list = value_noise_1(1000, 200, 0);
  //       const row_color = getColor();
  //       for(let j = (-(map_size/2) + unit_size/2); j <= map_size/2; j+=unit_size){
  //         let coefficient = list[j - unit_size/2 + map_size/2]
  //         const scale_Coefficient = Number((coefficient * (floor_Scale[1] - floor_Scale[0]) + floor_Scale[0]).toFixed(1));
  //         const y_axis = floor_size[1]*scale_Coefficient / 2;
  //         let color = floor_color
  //         color = row_color
  //         const material = new THREE.MeshStandardMaterial({color});
  //         const cube = new THREE.Mesh( geometry, material );
  //         cube.scale.y = scale_Coefficient;
  //         cube.position.set(i,y_axis,j)
  //         scene.add( cube );
  //         floor_list.push(cube)
  //         maplist.push([i,j])
  //       } 
  //     }
  //   }

  //   // const wall_cube_list:any[] = [];
  //   // // 添加角色
  //   // createPlayer()
  //   // function createPlayer(){
  //   //   const sphere_geometry = new THREE.SphereGeometry( unit_size/2, 32, 16 );
  //   //   const sphere_material = new THREE.MeshNormalMaterial();
  //   //   const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  //   //   let player_X = 5;
  //   //   let player_Z = 5;
  //   //   do {
  //   //     player_X = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //   //     player_Z = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //   //     if(wall_cube_list.findIndex(item=>item.position.x === player_X && item.position.z === player_Z) < 0 ){
  //   //       break;
  //   //     }
  //   //   } while (true);
      
  //   //   const now_floor = floor_list.find(item => item.position.x === player_X && item.position.z === player_Z )
  //   //   console.info(now_floor);
  //   //   sphere.position.set(player_X,(unit_size / 2) + now_floor.scale.y,player_Z)
  //   //   scene.add( sphere );
  //   // }
    




  //   // 设置障碍
  //   // const wall_geometry = new THREE.BoxGeometry( 10, 10, 10 );
  //   // const wall_cube_list:any[] = [];
  //   // for(let i = 0 ; i < 10 ; i++){
  //   //   const material = new THREE.MeshBasicMaterial( {color: getColor()} );
  //   //   const cube = new THREE.Mesh( wall_geometry, material );
  //   //   let X = 5;
  //   //   let Z = 5;
  //   //   do {
  //   //     X = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //   //     Z = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //   //     if(wall_cube_list.findIndex(item=>item.position.x === X && item.position.z === Z) < 0 ){
  //   //       break;
  //   //     }
  //   //   } while (true);
  //   //   cube.position.set(
  //   //     X,
  //   //     5,
  //   //     Z
  //   //   )
  //   //   scene.add( cube );
  //   //   wall_cube_list.push(cube)
  //   // }

    

  // // // 部署开始点
  // // let openList = [{
  // //   axis: [sphere.position.x,sphere.position.z],
  // //   parent: null
  // // }];

  // // // 部署结束点以及添加墙体
  // // let closeList = wall_cube_list.map(item=>({
  // //   axis:[item.position.x,item.position.z],
  // //   parent: null
  // // }))


  // // // 计算路径
  // // getRow()
  // // function getRow (){
  // //   if(openList.length === 0){
  // //     console.info("is end")
  // //     setTimeout(()=>{
  // //       floor_list.forEach(item=>{
  // //         item.material.color.set(floor_color)
  // //       })
  // //     }, 200)
  // //   }
  // //   else {
  // //     const checkNum = openList[0]
  // //     const checkObj = floor_list.find(item=>item.position.x === checkNum.axis[0] && item.position.z === checkNum.axis[1])
  // //     checkObj.material.color.set(getColor());
      
  // //     let list = [
  // //       [ checkNum.axis[0] - 10 , checkNum.axis[1] ],
  // //       [ checkNum.axis[0] + 10 , checkNum.axis[1] ],
  // //       [ checkNum.axis[0] , checkNum.axis[1] - 10 ],
  // //       [ checkNum.axis[0] , checkNum.axis[1] + 10 ]
  // //     ]

  // //     list = list.filter(item=>Math.abs(item[0]) <= 45 && Math.abs(item[1]) <= 45).map(item=>({axis:item,parent:checkNum.axis}))
      
  // //     list = list.filter(item => {
  // //         return(openList.findIndex(openItem => openItem.axis.toString() === item.axis.toString()) +
  // //         closeList.findIndex(closeItem => closeItem.axis.toString() === item.axis.toString())
  // //         === -2)
  // //     })

  //     // const set_list = new Set(openList)
  //     // list.forEach(item=>{
  //     //   set_list.add(item)
  //     // })
  //     // openList = [...set_list];

  // //     openList = openList.concat(list);

  // //     closeList.push(checkNum);
  // //     openList.shift()

  // //     setTimeout(()=>{
  // //       getRow()
  // //     }, 10)
  // //   }
  // // }

  // // let RenderRowList = []
  // // // 添加点击事件
  // // window.addEventListener( 'click', onMouseClick, false );
  // // //声明raycaster和mouse变量
  // // let raycaster = new THREE.Raycaster();
  // // let mouse = new THREE.Vector2();
  // // function onMouseClick( event:MouseEvent ) {
  // //       //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  // //       mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  // //       mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  // //       // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
  // //       raycaster.setFromCamera( mouse, camera );
  // //       // console.info(raycaster)
  // //       // 获取raycaster直线和所有模型相交的数组集合
  // //       let intersects = raycaster.intersectObjects( scene.children );

  // //       const clickList = intersects.filter(item=>floor_list.findIndex(allcubeitem => allcubeitem.id === item.object.id) >= 0)
  // //       if(clickList.length > 0){
  // //         const click_obj = clickList[0]
  // //         const click_axis = closeList.find(item=>click_obj.object.position.x === item.axis[0] &&click_obj.object.position.z === item.axis[1] )
  // //         RenderRow(click_axis)
  // //       }

  // //   }

  // //   function RenderRow(obj){
  // //     RenderRowList.push(obj)
  // //     if(obj.parent === null){
  // //       console.info('is End');
  // //       RenderRowList.reverse()


  // //       RenderRowList.forEach((item, index)=>{
  // //         const checkObj = floor_list.find(aitem=>aitem.position.x === item.axis[0] && aitem.position.z === item.axis[1])
  // //         setTimeout(()=>{
  // //           checkObj.material.color.set("#00aaaa");
  // //           sphere.position.set(checkObj.position.x,5,checkObj.position.z)
  // //         }, 100*index)
  // //       })
        
  // //     }
  // //     else{
  // //       const parent_obj = closeList.find(item=>obj.parent.toString() === item.axis.toString())
  // //       // setTimeout(()=>{
  // //       RenderRow(parent_obj)
  // //       // },10)
  // //     }
  // //     // const checkObj = floor_list.find(aitem=>aitem.position.x === obj.axis[0] && aitem.position.z === obj.axis[1])
  // //     // checkObj.material.color.set("#aaaa00");

  // //   }
















































    //   // const floor_3_group = new THREE.Group();
    //   // floor_Scale = [.1, 1]
    //   // const list_3 = [
    //   //   // 3维 全随机算法
    //   //   [ floor_size, utils.random_noise_3([10,10,10]), floor_3_group, floor_Scale, 0],
    //   //   [ floor_size, utils.value_noise_3(), floor_3_group, floor_Scale, 20],
    //   // ]
    //   // list_3.forEach(item=>{
    //   //   utils.render_3_block(item);
    //   // })
    //   // const thing_3 = utils.box_center_world(floor_3_group);
    //   // scene.add( thing_3 );

    // }















































































    
    
  //   // 设置桌面
  //   // createTable()
  //   function createTable(){
  //     const plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );
  //     const helper = new THREE.PlaneHelper( plane, map_size, 0xffff00 );
  //     scene.add( helper );
  //   }

  //   // 设置路径辅助 地板
  //   const floor_list:any[] = [];
  //   const maplist:[number,number][] = [];
  //   const floor_size = [unit_size, 1, unit_size];
  //   const floor_color = getColor();
  //   const floor_Scale = [0.1,10];
  //   createFloor()
  //   function createFloor(){
  //     const geometry = new THREE.BoxGeometry( ...floor_size );
  //     for(let i = (-(map_size/2) + unit_size/2); i <= map_size/2; i+=unit_size){
  //       for(let j = (-(map_size/2) + unit_size/2); j <= map_size/2; j+=unit_size){
  //         // const material = new THREE.MeshNormalMaterial();
  //         // const material = new THREE.MeshDepthMaterial();
  //         // const material = new THREE.MeshBasicMaterial( {color: floor_color} );
  //         // const material = new THREE.MeshLambertMaterial({color: floor_color});
  //         const scale_Coefficient = Number((Math.random()*(floor_Scale[1] - floor_Scale[0]) + floor_Scale[0]).toFixed(1));
  //         const y_axis = floor_size[1]*scale_Coefficient / 2;
  //         let color = floor_color
  //         if (scale_Coefficient <= 10) color = "#000000";
  //         if (scale_Coefficient <= 7.5) color = "#ffff00";
  //         if (scale_Coefficient <= 5) color = "#00ff00";
  //         if (scale_Coefficient <= 2.5) color = "#00ffff";
  //         const material = new THREE.MeshStandardMaterial({color});
          
  //         const cube = new THREE.Mesh( geometry, material );

          
  //         cube.scale.y = scale_Coefficient;
  //         cube.position.set(i,y_axis,j)
          
  //         scene.add( cube );
  //         floor_list.push(cube)
  //         maplist.push([i,j])
  //       } 
  //     } 
  //   }

  //   // const wall_cube_list:any[] = [];
  //   // // 添加角色
  //   // createPlayer()
  //   // function createPlayer(){
  //   //   const sphere_geometry = new THREE.SphereGeometry( unit_size/2, 32, 16 );
  //   //   const sphere_material = new THREE.MeshNormalMaterial();
  //   //   const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  //   //   let player_X = 5;
  //   //   let player_Z = 5;
  //   //   do {
  //   //     player_X = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //   //     player_Z = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //   //     if(wall_cube_list.findIndex(item=>item.position.x === player_X && item.position.z === player_Z) < 0 ){
  //   //       break;
  //   //     }
  //   //   } while (true);
      
  //   //   const now_floor = floor_list.find(item => item.position.x === player_X && item.position.z === player_Z )
  //   //   console.info(now_floor);
  //   //   sphere.position.set(player_X,(unit_size / 2) + now_floor.scale.y,player_Z)
  //   //   scene.add( sphere );
  //   // }
    




  //   // 设置障碍
  //   // const wall_geometry = new THREE.BoxGeometry( 10, 10, 10 );
  //   // const wall_cube_list:any[] = [];
  //   // for(let i = 0 ; i < 10 ; i++){
  //   //   const material = new THREE.MeshBasicMaterial( {color: getColor()} );
  //   //   const cube = new THREE.Mesh( wall_geometry, material );
  //   //   let X = 5;
  //   //   let Z = 5;
  //   //   do {
  //   //     X = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //   //     Z = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //   //     if(wall_cube_list.findIndex(item=>item.position.x === X && item.position.z === Z) < 0 ){
  //   //       break;
  //   //     }
  //   //   } while (true);
  //   //   cube.position.set(
  //   //     X,
  //   //     5,
  //   //     Z
  //   //   )
  //   //   scene.add( cube );
  //   //   wall_cube_list.push(cube)
  //   // }

    

  // // // 部署开始点
  // // let openList = [{
  // //   axis: [sphere.position.x,sphere.position.z],
  // //   parent: null
  // // }];

  // // // 部署结束点以及添加墙体
  // // let closeList = wall_cube_list.map(item=>({
  // //   axis:[item.position.x,item.position.z],
  // //   parent: null
  // // }))


  // // // 计算路径
  // // getRow()
  // // function getRow (){
  // //   if(openList.length === 0){
  // //     console.info("is end")
  // //     setTimeout(()=>{
  // //       floor_list.forEach(item=>{
  // //         item.material.color.set(floor_color)
  // //       })
  // //     }, 200)
  // //   }
  // //   else {
  // //     const checkNum = openList[0]
  // //     const checkObj = floor_list.find(item=>item.position.x === checkNum.axis[0] && item.position.z === checkNum.axis[1])
  // //     checkObj.material.color.set(getColor());
      
  // //     let list = [
  // //       [ checkNum.axis[0] - 10 , checkNum.axis[1] ],
  // //       [ checkNum.axis[0] + 10 , checkNum.axis[1] ],
  // //       [ checkNum.axis[0] , checkNum.axis[1] - 10 ],
  // //       [ checkNum.axis[0] , checkNum.axis[1] + 10 ]
  // //     ]

  // //     list = list.filter(item=>Math.abs(item[0]) <= 45 && Math.abs(item[1]) <= 45).map(item=>({axis:item,parent:checkNum.axis}))
      
  // //     list = list.filter(item => {
  // //         return(openList.findIndex(openItem => openItem.axis.toString() === item.axis.toString()) +
  // //         closeList.findIndex(closeItem => closeItem.axis.toString() === item.axis.toString())
  // //         === -2)
  // //     })

  //     // const set_list = new Set(openList)
  //     // list.forEach(item=>{
  //     //   set_list.add(item)
  //     // })
  //     // openList = [...set_list];

  // //     openList = openList.concat(list);

  // //     closeList.push(checkNum);
  // //     openList.shift()

  // //     setTimeout(()=>{
  // //       getRow()
  // //     }, 10)
  // //   }
  // // }

  // // let RenderRowList = []
  // // // 添加点击事件
  // // window.addEventListener( 'click', onMouseClick, false );
  // // //声明raycaster和mouse变量
  // // let raycaster = new THREE.Raycaster();
  // // let mouse = new THREE.Vector2();
  // // function onMouseClick( event:MouseEvent ) {
  // //       //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  // //       mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  // //       mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  // //       // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
  // //       raycaster.setFromCamera( mouse, camera );
  // //       // console.info(raycaster)
  // //       // 获取raycaster直线和所有模型相交的数组集合
  // //       let intersects = raycaster.intersectObjects( scene.children );

  // //       const clickList = intersects.filter(item=>floor_list.findIndex(allcubeitem => allcubeitem.id === item.object.id) >= 0)
  // //       if(clickList.length > 0){
  // //         const click_obj = clickList[0]
  // //         const click_axis = closeList.find(item=>click_obj.object.position.x === item.axis[0] &&click_obj.object.position.z === item.axis[1] )
  // //         RenderRow(click_axis)
  // //       }

  // //   }

  // //   function RenderRow(obj){
  // //     RenderRowList.push(obj)
  // //     if(obj.parent === null){
  // //       console.info('is End');
  // //       RenderRowList.reverse()


  // //       RenderRowList.forEach((item, index)=>{
  // //         const checkObj = floor_list.find(aitem=>aitem.position.x === item.axis[0] && aitem.position.z === item.axis[1])
  // //         setTimeout(()=>{
  // //           checkObj.material.color.set("#00aaaa");
  // //           sphere.position.set(checkObj.position.x,5,checkObj.position.z)
  // //         }, 100*index)
  // //       })
        
  // //     }
  // //     else{
  // //       const parent_obj = closeList.find(item=>obj.parent.toString() === item.axis.toString())
  // //       // setTimeout(()=>{
  // //       RenderRow(parent_obj)
  // //       // },10)
  // //     }
  // //     // const checkObj = floor_list.find(aitem=>aitem.position.x === obj.axis[0] && aitem.position.z === obj.axis[1])
  // //     // checkObj.material.color.set("#aaaa00");

  // //   }




































































































  
    // // 设置路径辅助 地板
    // let floor_Scale:[number,number] = [1,10];
    // const floor_size:[number,number,number] = [unit_size, unit_size, unit_size];
    // createFloor()
    // function createFloor(){
    //   const floor_1_group = new THREE.Group();
    //   const list_1:utils_d.render_item_1[] = [
    //     // 1维 value_noise_不均衡_不覆盖
    //     [floor_size,utils.value_noise_1(40,10,[.4,.4], 0, 0), floor_1_group,floor_Scale,0,0],
    //     // 1维 value_noise_不均衡_覆盖
    //     [floor_size,utils.value_noise_1(40,10,[.4,.4], 0, 1),floor_1_group,floor_Scale,10, 60],
    //     // 1维 value_noise_均衡_不覆盖
    //     [floor_size,utils.value_noise_1(40,10,[.4,.4], 1, 0),floor_1_group,floor_Scale,20, 120],
    //     // 1维 value_noise_均衡_覆盖
    //     [floor_size,utils.value_noise_1(40,10,[.4,.4], 1, 1),floor_1_group,floor_Scale,30, 180],
    //     // 1维 value_noise_全随机算法
    //     [floor_size,utils.value_noise_1(40,40),floor_1_group,floor_Scale,40],
    //     // 1维 全随机算法
    //     [floor_size,utils.random_noise_1(40),floor_1_group,floor_Scale,50],
    //   ]
    //   list_1.forEach(item=>{
    //     utils.render_1_block(item)
        
    //   })
    //   const thing_1 = utils.box_center_world(floor_1_group);
    //   scene.add( thing_1 );




    //   // const floor_2_group = new THREE.Group();
    //   // const list_2:utils_d.render_item_2[] = [
    //   //   // 2维 全随机算法
    //   //   [ floor_size, utils.random_noise_2([20,20]), floor_2_group, floor_Scale, 0],
    //   //   // // 2维 y=6x^5-15x^4+10x^3_插值_单边计算
    //   //   // [ floor_size, utils.value_noise_2([4,4], 20, "b"), floor_2_group, floor_Scale, 30],
    //   //   // // 2维 value_noise算法_线性插值
    //   //   // [ floor_size, utils.value_noise_2([16,16], 20, "a"), floor_2_group, floor_Scale, 60],
    //   //   // // 2维 value_noise算法_y=6x^5-15x^4+10x^3_插值
    //   //   // [ floor_size, utils.value_noise_2([16,16], 20, "c"), floor_2_group, floor_Scale, 90],
    //   // ]
    //   // list_2.forEach(item=>{
    //   //   utils.render_2_block(item);
    //   // })
    //   // const thing_2 = utils.box_center_world(floor_2_group);
    //   // scene.add( thing_2 );



    //   // const floor_3_group = new THREE.Group();
    //   // floor_Scale = [.1, 1]
    //   // const list_3 = [
    //   //   // 3维 全随机算法
    //   //   [ floor_size, utils.random_noise_3([10,10,10]), floor_3_group, floor_Scale, 0],
    //   //   [ floor_size, utils.value_noise_3(), floor_3_group, floor_Scale, 20],
    //   // ]
    //   // list_3.forEach(item=>{
    //   //   utils.render_3_block(item);
    //   // })
    //   // const thing_3 = utils.box_center_world(floor_3_group);
    //   // scene.add( thing_3 );

    // }


































































































    // const wall_cube_list:any[] = [];
    // // 添加角色
    // createPlayer()
    // function createPlayer(){
    //   const sphere_geometry = new THREE.SphereGeometry( unit_size/2, 32, 16 );
    //   const sphere_material = new THREE.MeshNormalMaterial();
    //   const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
    //   let player_X = 5;
    //   let player_Z = 5;
    //   do {
    //     player_X = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
    //     player_Z = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
    //     if(wall_cube_list.findIndex(item=>item.position.x === player_X && item.position.z === player_Z) < 0 ){
    //       break;
    //     }
    //   } while (true);
      
    //   const now_floor = floor_list.find(item => item.position.x === player_X && item.position.z === player_Z )
    //   console.info(now_floor);
    //   sphere.position.set(player_X,(unit_size / 2) + now_floor.scale.y,player_Z)
    //   scene.add( sphere );
    // }
    




    // 设置障碍
    // const wall_geometry = new THREE.BoxGeometry( 10, 10, 10 );
    // const wall_cube_list:any[] = [];
    // for(let i = 0 ; i < 10 ; i++){
    //   const material = new THREE.MeshBasicMaterial( {color: getColor()} );
    //   const cube = new THREE.Mesh( wall_geometry, material );
    //   let X = 5;
    //   let Z = 5;
    //   do {
    //     X = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
    //     Z = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
    //     if(wall_cube_list.findIndex(item=>item.position.x === X && item.position.z === Z) < 0 ){
    //       break;
    //     }
    //   } while (true);
    //   cube.position.set(
    //     X,
    //     5,
    //     Z
    //   )
    //   scene.add( cube );
    //   wall_cube_list.push(cube)
    // }

    

  // // 部署开始点
  // let openList = [{
  //   axis: [sphere.position.x,sphere.position.z],
  //   parent: null
  // }];

  // // 部署结束点以及添加墙体
  // let closeList = wall_cube_list.map(item=>({
  //   axis:[item.position.x,item.position.z],
  //   parent: null
  // }))


  // // 计算路径
  // getRow()
  // function getRow (){
  //   if(openList.length === 0){
  //     console.info("is end")
  //     setTimeout(()=>{
  //       floor_list.forEach(item=>{
  //         item.material.color.set(floor_color)
  //       })
  //     }, 200)
  //   }
  //   else {
  //     const checkNum = openList[0]
  //     const checkObj = floor_list.find(item=>item.position.x === checkNum.axis[0] && item.position.z === checkNum.axis[1])
  //     checkObj.material.color.set(getColor());
      
  //     let list = [
  //       [ checkNum.axis[0] - 10 , checkNum.axis[1] ],
  //       [ checkNum.axis[0] + 10 , checkNum.axis[1] ],
  //       [ checkNum.axis[0] , checkNum.axis[1] - 10 ],
  //       [ checkNum.axis[0] , checkNum.axis[1] + 10 ]
  //     ]

  //     list = list.filter(item=>Math.abs(item[0]) <= 45 && Math.abs(item[1]) <= 45).map(item=>({axis:item,parent:checkNum.axis}))
      
  //     list = list.filter(item => {
  //         return(openList.findIndex(openItem => openItem.axis.toString() === item.axis.toString()) +
  //         closeList.findIndex(closeItem => closeItem.axis.toString() === item.axis.toString())
  //         === -2)
  //     })

      // const set_list = new Set(openList)
      // list.forEach(item=>{
      //   set_list.add(item)
      // })
      // openList = [...set_list];

  //     openList = openList.concat(list);

  //     closeList.push(checkNum);
  //     openList.shift()

  //     setTimeout(()=>{
  //       getRow()
  //     }, 10)
  //   }
  // }

  // let RenderRowList = []
  // // 添加点击事件
  // window.addEventListener( 'click', onMouseClick, false );
  // //声明raycaster和mouse变量
  // let raycaster = new THREE.Raycaster();
  // let mouse = new THREE.Vector2();
  // function onMouseClick( event:MouseEvent ) {
  //       //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  //       mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //       mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  //       // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
  //       raycaster.setFromCamera( mouse, camera );
  //       // console.info(raycaster)
  //       // 获取raycaster直线和所有模型相交的数组集合
  //       let intersects = raycaster.intersectObjects( scene.children );

  //       const clickList = intersects.filter(item=>floor_list.findIndex(allcubeitem => allcubeitem.id === item.object.id) >= 0)
  //       if(clickList.length > 0){
  //         const click_obj = clickList[0]
  //         const click_axis = closeList.find(item=>click_obj.object.position.x === item.axis[0] &&click_obj.object.position.z === item.axis[1] )
  //         RenderRow(click_axis)
  //       }

  //   }

  //   function RenderRow(obj){
  //     RenderRowList.push(obj)
  //     if(obj.parent === null){
  //       console.info('is End');
  //       RenderRowList.reverse()


  //       RenderRowList.forEach((item, index)=>{
  //         const checkObj = floor_list.find(aitem=>aitem.position.x === item.axis[0] && aitem.position.z === item.axis[1])
  //         setTimeout(()=>{
  //           checkObj.material.color.set("#00aaaa");
  //           sphere.position.set(checkObj.position.x,5,checkObj.position.z)
  //         }, 100*index)
  //       })
        
  //     }
  //     else{
  //       const parent_obj = closeList.find(item=>obj.parent.toString() === item.axis.toString())
  //       // setTimeout(()=>{
  //       RenderRow(parent_obj)
  //       // },10)
  //     }
  //     // const checkObj = floor_list.find(aitem=>aitem.position.x === obj.axis[0] && aitem.position.z === obj.axis[1])
  //     // checkObj.material.color.set("#aaaa00");

  //   }






















































































  
  //   // 设置桌面
  //   const plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) );
  //   const helper = new THREE.PlaneHelper( plane, 100, 0xffffff );
  //   scene.add( helper );

  //   // 设置路径辅助 地板
  //   const geometry = new THREE.BoxGeometry( 10, 2, 10 );
  //   const floor_list:any[] = [];
  //   const maplist:[number,number][] = [];
  //   const floor_color = getColor();
  //   for(let i = -45; i <= 45; i+=10){
  //     for(let j = -45; j <= 45; j+=10){
  //       const material = new THREE.MeshBasicMaterial( {color: floor_color} );
  //       const cube = new THREE.Mesh( geometry, material );
  //       cube.position.set(i,1,j)
  //       scene.add( cube );
  //       floor_list.push(cube)
  //       maplist.push([i,j])
  //     } 
  //   } 

  //   // 设置障碍
  //   const wall_geometry = new THREE.BoxGeometry( 10, 10, 10 );
  //   const wall_cube_list:any[] = [];

  //   for(let i = 0 ; i < 10 ; i++){
  //     const material = new THREE.MeshBasicMaterial( {color: getColor()} );
  //     const cube = new THREE.Mesh( wall_geometry, material );
      
  //     let X = 5;
  //     let Z = 5;
  //     do {
  //       X = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //       Z = (Math.floor(Math.random() * 5) * 10+5) * (i % 2 === 0?1:-1);
  //       if(wall_cube_list.findIndex(item=>item.position.x === X && item.position.z === Z) < 0 ){
  //         break;
  //       }
  //     } while (true);

  //     cube.position.set(
  //       X,
  //       5,
  //       Z
  //     )

  //     scene.add( cube );
  //     wall_cube_list.push(cube)
  //   }

  //   // 添加角色
  //   const sphere_geometry = new THREE.SphereGeometry( 5, 32, 16 );
  //   const sphere_material = new THREE.MeshNormalMaterial();
  //   const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  //   let player_X = 5;
  //   let player_Z = 5;
  //   do {
  //     player_X = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //     player_Z = (Math.floor(Math.random() * 5) * 10+5) * (Math.random() > .5 ?1:-1);
  //     if(wall_cube_list.findIndex(item=>item.position.x === player_X && item.position.z === player_Z) < 0 ){
  //       break;
  //     }
  //   } while (true);

  //   sphere.position.set(player_X,5,player_Z)
  //   scene.add( sphere );

  // // 部署开始点
  // let openList = [{
  //   axis: [sphere.position.x,sphere.position.z],
  //   parent: null
  // }];

  // // 部署结束点以及添加墙体
  // let closeList = wall_cube_list.map(item=>({
  //   axis:[item.position.x,item.position.z],
  //   parent: null
  // }))


  // // 计算路径
  // getRow()
  // function getRow (){
  //   if(openList.length === 0){
  //     console.info("is end")
  //     setTimeout(()=>{
  //       floor_list.forEach(item=>{
  //         item.material.color.set(floor_color)
  //       })
  //     }, 200)
  //   }
  //   else {
  //     const checkNum = openList[0]
  //     const checkObj = floor_list.find(item=>item.position.x === checkNum.axis[0] && item.position.z === checkNum.axis[1])
  //     checkObj.material.color.set(getColor());
      
  //     let list = [
  //       [ checkNum.axis[0] - 10 , checkNum.axis[1] ],
  //       [ checkNum.axis[0] + 10 , checkNum.axis[1] ],
  //       [ checkNum.axis[0] , checkNum.axis[1] - 10 ],
  //       [ checkNum.axis[0] , checkNum.axis[1] + 10 ]
  //     ]

  //     list = list.filter(item=>Math.abs(item[0]) <= 45 && Math.abs(item[1]) <= 45).map(item=>({axis:item,parent:checkNum.axis}))
      
  //     list = list.filter(item => {
  //         return(openList.findIndex(openItem => openItem.axis.toString() === item.axis.toString()) +
  //         closeList.findIndex(closeItem => closeItem.axis.toString() === item.axis.toString())
  //         === -2)
  //     })

  //     // const set_list = new Set(openList)
  //     // list.forEach(item=>{
  //     //   set_list.add(item)
  //     // })
  //     // openList = [...set_list];

  //     openList = openList.concat(list);

  //     closeList.push(checkNum);
  //     openList.shift()

  //     setTimeout(()=>{
  //       getRow()
  //     }, 10)
  //   }
  // }
  // let RenderRowList = []

  // // 添加点击事件
  // window.addEventListener( 'click', onMouseClick, false );
  // //声明raycaster和mouse变量
  // var raycaster = new THREE.Raycaster();
  // var mouse = new THREE.Vector2();
  // function onMouseClick( event:MouseEvent ) {
  //       //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  //       mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //       mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  //       // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
  //       raycaster.setFromCamera( mouse, camera );
  //       // console.info(raycaster)
  //       // 获取raycaster直线和所有模型相交的数组集合
  //       var intersects = raycaster.intersectObjects( scene.children );

  //       const clickList = intersects.filter(item=>floor_list.findIndex(allcubeitem => allcubeitem.id === item.object.id) >= 0)
  //       if(clickList.length > 0){
  //         const click_obj = clickList[0]
  //         const click_axis = closeList.find(item=>click_obj.object.position.x === item.axis[0] &&click_obj.object.position.z === item.axis[1] )
  //         RenderRow(click_axis)
  //       }

  //   }

  //   function RenderRow(obj){
  //     RenderRowList.push(obj)
  //     if(obj.parent === null){
  //       console.info('is End');
  //       RenderRowList.reverse()


  //       RenderRowList.forEach((item, index)=>{
  //         const checkObj = floor_list.find(aitem=>aitem.position.x === item.axis[0] && aitem.position.z === item.axis[1])
  //         setTimeout(()=>{
  //           checkObj.material.color.set("#00aaaa");
  //           sphere.position.set(checkObj.position.x,5,checkObj.position.z)
  //         }, 100*index)
  //       })
        
  //     }
  //     else{
  //       const parent_obj = closeList.find(item=>obj.parent.toString() === item.axis.toString())
  //       // setTimeout(()=>{
  //       RenderRow(parent_obj)
  //       // },10)
  //     }
  //     // const checkObj = floor_list.find(aitem=>aitem.position.x === obj.axis[0] && aitem.position.z === obj.axis[1])
  //     // checkObj.material.color.set("#aaaa00");

  //   }



