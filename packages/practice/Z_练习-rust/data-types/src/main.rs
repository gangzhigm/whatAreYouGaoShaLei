// fn main() {
//     // let tup = (500, 6.4, 1);
//     // // let (x, y, z) = tup;
//     // // let five_hundred = tup.0;
//     // // println!("{},{},{}",x,y,z);
//     // println!("{}",tup.0);
//     // println!("{}",tup.1);
//     // println!("{}",tup.2);
//     // let a:[i32:5] = [ 1, 2, 3, 4, 5];
//     // let a = [ 1;6 ];
//     let a = [ 1, 2, 3, 4, 5 ];
//     let first = a[0];
//     let second = a[1];
//     println!("{}",first);
//     println!("{}",second);
//     println!("{}",a[3]);

// }

use std::io;

fn main() {
    let a = [1, 2, 3, 4, 5];

    println!("Please enter an array index.");

    let mut index = String::new();

    io::stdin()
        .read_line(&mut index)
        .expect("Failed to read line");

    let index: usize = index
        .trim()
        .parse()
        .expect("Index entered was not a number");

    let element = a[index];

    println!(
        "The value of the element at index {} is: {}",
        index, element
    );
}
