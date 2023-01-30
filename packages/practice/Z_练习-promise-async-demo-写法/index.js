// console.log("before");
// setTimeout(()=>{
//     console.info("reading a user from a database")
// }, 2000)
// console.log("after  ");




// console.info("before");
// const user = getUser(1);
// console.info(user);
// console.info("after");


// function getUser(id) {  
//     setTimeout(()=>{
//         console.info("reading user from database");
//         return { id: id, githubusername: "mosh"};
//     }, 2000)
// // }



// console.info("before");
// getUser(1, (user)=>{
//     console.info(user);
// });
// console.info("after");


// function getUser(id, callback) {  
//     setTimeout(()=>{
//         console.info("reading user from database");
//         callback({ id: id, githubusername: "mosh"});
//     }, 2000)
// }





const p = new Promise((resolve, reject) => {
    // some async work
    // ...

    // resolve(1);
    setTimeout(() => {  
        // resolve(0); 
        reject(new Error("Failed to connect to GitHub"));  
    }, 2000);
})

p.then(result=>{
  
    console.info(result)
})
.catch(err=>{           
    console.info(err)
})