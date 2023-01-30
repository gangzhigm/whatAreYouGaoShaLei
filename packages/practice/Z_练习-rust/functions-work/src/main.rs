fn main() {
    println!("Hello, world!");
    another_function(-5,'h',"jh");
    println!("{}",five(152));
    println!("{}",six(4));
}

fn another_function(x:i32,y:char,z:&str){
    println!("Another function.{}.{}.{}",x,y,z);
}

fn five(a:u8) -> u8 {
    a + 5
}
fn six(b:u32) -> u8 {
    return (b + 6).try_into().unwrap();
}