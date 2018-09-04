const INTEND_TO_FETCH = 'INTEND_TO_FETCH'
const SUCCEED_TO_FETCH = 'SUCCEED_TO_FETCH'
const FAIL_TO_FETCH = 'FAIL_TO_FETCH'

const intendToFetch = () => ({ type: INTEND_TO_FETCH })
const succeedToFetch = (res) => ({ type: SUCCEED_TO_FETCH, payload: res })
const failToFetch = (err) => ({ type: FAIL_TO_FETCH, payload: err })

const store = {
  state: {
    hasBeenFetched: false,
    isFetching: false,
    people: null,
    failedToFetch: null,
    errorMessage: null,
  },
  reduce: function(action) {
    console.log('previous state: ', this.state)
    console.log('action: ', action)
    const override  = (() => {
      switch (action.type) {
        case INTEND_TO_FETCH:
          return { isFetching: true }
        case SUCCEED_TO_FETCH:
          return { isFetching: false, hasBeenFetched: true, people: action.payload }
        case FAIL_TO_FETCH:
          return { isFetching: false, failedToFetch: true, errorMessage: action.payload }
        default:
          return null
      }
    })()
    this.state = { ...this.state, ...override }
    console.log('next state: ', this.state)
  },
  dispatch: function( action ) {
    if (!action.type || typeof action.type !== 'string') throw new Error('Oh no! We dispatched an unexpected value!')
    this.reduce(action)
    return action
  }
}

const delay = (time) => new Promise((resolve, reject) => {
  if (time < 0) return reject('negative integers are not accepted when calling `delay`')
  return setTimeout(() => resolve(), time)
})

const ajaxCall = ( isTrue ) => {
  return delay(-100).then(
    () => {
      const people = [
        {id: 'awad', name: 'rufael', age: 1, responsible: true, hungry: false},
        {id: 'awafwaad', name: 'walter', age: 2, responsible: true, hungry: true},
        {id: 'afawad', name: 'chrissy', age: 3, responsible: false, hungry: false},
        {id: 'awfaawad', name: 'peter', age: 4, responsible: false, hungry: true},
      ]
      return people
    }
  )
}

const reduxThunk = () => (dispatch) => {
  dispatch(intendToFetch())
  return ajaxCall()
    .then(
      (res) => {
        dispatch( succeedToFetch( res ) )
        },
      (err) => {
        dispatch(failToFetch(err))
      }
    )
}

const selectPerson = (state, personId) => {
  if (state.people === null) return null
  return state.people.find( obj => obj.id === personId )
}

const weAreRunningThisInAView = () => reduxThunk()(store.dispatch.bind(store))

// PersonDetailView.js
class PersonDetailView {
  constructor(props) {
    this.props = props
    props.weAreRunningThisInAView().then(
      (res) => {
        this.props = mapStoreToProps()
        this.render()
      }
    )
  }

  render() {
    console.log('RENDER')
    if (this.props.isLoading) {
      console.log(`<div>page is loading</div>`)
    }
    else if(this.props.failedToFetch) {
      console.log(`<div>{ ${this.props.errorMessage} }</div>`)
    }
    else {
      console.log(`<div>{ ${this.props.name} }</div>`)
      console.log(`<div>{ ${this.props.id} }</div>`)
    }
  }
}
//
const mapStoreToProps = () => {
  const isLoading = !store.state.hasBeenFetched  && !store.state.failedToFetch
  if( isLoading ) return { weAreRunningThisInAView, isLoading }

  const failedToFetch = store.state.failedToFetch
  if ( failedToFetch ){
    const errorMessage = store.state.errorMessage
    return { weAreRunningThisInAView, isLoading, failedToFetch : true, errorMessage }
  }

  const selectedPerson = selectPerson(store.state, 'awafwaad')
  return {
    weAreRunningThisInAView,
    isLoading,
    id: selectedPerson.id,
    name: selectedPerson.name,
  }
}

const detailView = new PersonDetailView(mapStoreToProps())
detailView.render()

/*
  render error message
 */
