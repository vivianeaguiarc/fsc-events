const sumAsync = async (a: number, b: number) => {
  return a + b
}

await sumAsync(2, 3).then(result => console.log(result))

export { sumAsync }