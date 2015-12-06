(a+b) - (c&d)

"-": [
  "+": [
    a,
    b
  ],
  '&': [
    c,
    d
  ]
]

{
   function gen(content) {
      // on regarde tous les éléments : 
      
   }
}

start
  = expression

item = it:("%"[^%]+"%") {return [].concat.apply([], it).join("");}

_ "space" = [\n\t ]* {return "";}

factor
 = "(" _ expr:expression _ ")" {
   return '(' + expr + ')';
}
 / item

expression
 = head:factor tail:(_ ("+" / "-" / "&") _ factor _)* {
   var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "+") { result += "+" + tail[i][3];}
        if (tail[i][1] === "-") { result += "-" + tail[i][3];}
        if (tail[i][1] === "&") { result += "&" + tail[i][3];}
      }

      return result;
}