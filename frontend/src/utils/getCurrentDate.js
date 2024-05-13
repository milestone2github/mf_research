
export default function getCurrentDate() {
  let dt = new Date();

  let year = dt.getFullYear();
  let month = (dt.getMonth()+1).toString().padStart(2, '0');
  let date = dt.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${date}`
}
