const getTodos = async () => {
  return {
    code: 200,
    result: {
      list: [
        { id: 0, todo: 'item 0' },
        { id: 1, todo: 'item 1' },
        { id: 2, todo: 'item 2' },
        { id: 3, todo: 'item 3' },
        { id: 4, todo: 'item 4' },
      ],
    },
  };
};
export default getTodos;
