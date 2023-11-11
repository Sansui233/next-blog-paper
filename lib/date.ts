export function dateToYMDMM(d: Date): string{
  return d.getFullYear() + "-"
  + ("0"+(d.getMonth()+1)).slice(-2) + "-"
  + ( "0" + d.getDate()).slice(-2)  + " "
  + ("0" + d.getHours()).slice(-2) + ":" 
  + ("0" + d.getMinutes()).slice(-2);
}

// todo test cases "2021-01-01 00:00"
// "year-month-day" is required
export function parseDate(str: string): Date{
  let date = new Date(str)
  if(date.toString() !== "Invalid Date"){
    return date
  }else{
    if(str)
    str = str.slice(0,11) + "23:59:59" // fallback
    let date = new Date(str)
    if(date.toString() !== "Invalid Date"){
      return date
    }else{
      console.error("[date.ts] unable to parse date string", str, "\n set date to -1")
      return new Date(-1)
    }
  }
}