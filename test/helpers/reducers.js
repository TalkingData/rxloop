function id(state = []) {
  return (
    state.reduce((result, item) => (item.id > result ? item.id : result), 0) + 1
  )
}

export function ADD_TODO(state = [], action) {
  return [
    ...state,
    {
      id: id(state),
      text: action.text
    }
  ]
}

export function THROW_ERROR() {
  throw new Error()
}
