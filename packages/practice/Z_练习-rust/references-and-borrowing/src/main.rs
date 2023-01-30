// // // // fn main() {
// // // //     let s1 = String::from("hello");
    
// // // //     let len = calculate_length(&s1);

// // // //     println!("the length of '{}' is {}", s1, len);
// // // // }

// // // // fn calculate_length(s:&String)-> usize {
// // // //     s.len()
// // // // }

// // // // fn main() {
// // // //     let s = String::from("hello");

// // // //     change(&s);
// // // // }

// // // // fn change(some_string: &String) {
// // // //     some_string.push_str(", world");
// // // // }

// // // fn main() {
// // //     // let mut s = String::from("hello");

// // //     // change(&mut s);
// // //     let mut s = String::from("hello");

// // //     let r1 = &s; // 没问题
// // //     let r2 = &s; // 没问题
// // //     let r3 = &s; // 大问题

// // //     println!("{}, {}, and {}", r1, r2, r3);
// // // }

// // // // fn change(some_string: &mut String) {
// // // //     some_string.push_str(", world");
// // // // }

// // fn main() {
// //     let reference_to_nothing = dangle();
// // }

// // fn dangle() -> String {
// //     let s = String::from("hello");

// //     s
// // }

// // fn main(){
// //     let s = String::from("helloo world");
// //     let hello = &s[0..5];
// //     let world= &s[6..10];
// // }

// fn main(){
//     let my_string = String::from("hello world");

//     let word = first_word(&my_string[..]);

//     let my_string_literal = "hello world";

//     let word = first_word(&my_string_literal[..]);

//     let word = first_word(my_string_literal);
// }

fn main() {
    let s = String::from("broadcast");
    let c = &s;
    let part1 = &c[0..5];
    let part2 = &c[5..9];

    println!("{}={}+{}", s, part1, part2);
}