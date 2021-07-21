import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   Flex,
   Form,
   HelperText,
   RadioGroup,
   Spacer,
   Text,
   TunnelHeader,
   Dropdown,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import {
   CUISINES,
   UPDATE_RECIPE,
   CREATE_CUSINE_NAME,
} from '../../../../../graphql'
import validator from '../../validators'

const Information = ({ state }) => {
   // State
   const [_state, _dispatch] = React.useReducer(reducer, initialState)
   const options = [
      { id: 'Non-vegetarian', title: 'Non-vegetarian' },
      { id: 'Vegetarian', title: 'Vegetarian' },
      { id: 'Vegan', title: 'Vegan' },
   ]

   // Subscription
   const { data: { cuisineNames = [] } = {}, loading } = useSubscription(
      CUISINES,
      {
         onCompleted: data => {
            if (!state.cuisine && data.cuisineNames.length) {
               _dispatch({
                  type: 'SET_VALUE',
                  payload: {
                     field: 'cuisine',
                     value: data.cuisineNames[0].title,
                  },
               })
            }
         },
         onError: error => {
            console.log('Something went wrong!')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   // Mutation
   const [updateRecipe, { loading: inFlight }] = useMutation(UPDATE_RECIPE, {
      variables: {
         id: state.id,
         set: {
            type: _state.type.value,
            cuisine: _state.cuisine.value,
            cookingTime: _state.cookingTime.value || null,
            author: _state.author.value,
            utensils: _state.utensils.value
               ? _state.utensils.value.split(',').map(tag => tag.trim())
               : [],
            notIncluded: _state.notIncluded.value
               ? _state.notIncluded.value.split(',').map(tag => tag.trim())
               : [],
            description: _state.description.value,
         },
      },
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateType, { loading: loadingType }] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Updated Type!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateCuisine, { loading: loadingCuisine }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated Cuisine!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateCookingTime, { loading: loadingTime }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated Cooking Time!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateAuthor, { loading: loadingAuthor }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated Author Name!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateUtensils, { loading: loadingUtensils }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated utensils!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateNotIncluded, { loading: loadingnotIncluded }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated not included!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateDescription, { loading: loadingDesription }] = useMutation(
      UPDATE_RECIPE,
      {
         onCompleted: () => {
            toast.success('Updated description!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [createCuisine, { loading: craetingCuisine }] = useMutation(
      CREATE_CUSINE_NAME,
      {
         onCompleted: () => {
            toast.success('Created Cuisine!')
         },
         onError: error => {
            console.log(error)
            toast.error('Something went wrong!')

            logger(error)
         },
      }
   )

   const save = () => {
      if (inFlight) return
      if (_state.utensils.meta.isValid && _state.cookingTime.meta.isValid) {
         updateRecipe()
      } else {
         toast.error('Invalid values!')
      }
   }

   React.useEffect(() => {
      const seedState = {
         type: {
            value: state.type || 'Vegetarian',
         },
         cuisine: {
            value: state.cuisine === null ? '' : state.cuisine,
         },
         cookingTime: {
            value: state.cookingTime || '0',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         author: {
            value: state.author || '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         notIncluded: {
            value: state.notIncluded ? state.notIncluded.join(', ') : '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         utensils: {
            value: state.utensils ? state.utensils.join(', ') : '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         description: {
            value: state.description || '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
      }
      _dispatch({
         type: 'SEED',
         payload: {
            state: seedState,
         },
      })
   }, [state])

   console.log(state, 'state')

   let search = ''

   const changeType = title => {
      updateType({
         variables: {
            id: state.id,
            set: {
               type: title,
            },
         },
      })
   }

   const changeCuisine = cuisine => {
      updateCuisine({
         variables: {
            id: state.id,
            set: {
               cuisine: cuisine.title,
            },
         },
      })
   }

   const changeCookingTime = time => {
      updateCookingTime({
         variables: {
            id: state.id,
            set: {
               cookingTime: time,
            },
         },
      })
   }

   const changeAuthor = name => {
      updateAuthor({
         variables: {
            id: state.id,
            set: {
               author: name,
            },
         },
      })
   }

   const changeUtensils = utensils => {
      updateUtensils({
         variables: {
            id: state.id,
            set: {
               utensils: utensils.split(',').map(tag => tag.trim()),
            },
         },
      })
   }

   const changeNotIncluded = notIncluded => {
      updateNotIncluded({
         variables: {
            id: state.id,
            set: {
               notIncluded: notIncluded.split(',').map(tag => tag.trim()),
            },
         },
      })
   }

   const changeDescription = description => {
      updateDescription({
         variables: {
            id: state.id,
            set: {
               description: description,
            },
         },
      })
   }

   const searchedCuisineOption = searchedCuisine => {
      search = searchedCuisine
   }

   const quickCreateCuisine = () => {
      createCuisine({
         variables: {
            objects: {
               name: (search.charAt(0).toUpperCase() + search.slice(1)).trim(),
            },
         },
      })
   }
   return (
      <>
         <Flex width="100%">
            <Banner id="products-app-recipes-create-recipe-basic-information-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {cuisineNames.length ? (
                     <>
                        <Flex container alignItems="center">
                           <Text as="subtitle">Type</Text>
                           <Tooltip identifier="recipe_type" />
                        </Flex>
                        <RadioGroup
                           options={options}
                           active={_state.type.value}
                           onChange={option => {
                              _dispatch({
                                 type: 'SET_VALUE',
                                 payload: {
                                    field: 'type',
                                    value: option.title,
                                 },
                              })
                              changeType(option.title)
                           }}
                        />
                        <Spacer size="50px" />
                        <Flex container width="700px">
                           {/* <Form.Group>
                              <Form.Label htmlFor="cuisine" title="cuisine">
                                 <Flex container alignItems="center">
                                    Cuisine
                                    <Tooltip identifier="recipe_cuisine" />
                                 </Flex>
                              </Form.Label>
                              <Form.Select
                                 id="cuisine"
                                 name="cuisine"
                                 options={cuisineNames}
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'cuisine',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 value={_state.cuisine.value}
                                 placeholder="Choose cuisine"
                              />
                           </Form.Group> */}
                           <div
                              style={{
                                 display: 'inline-block',
                                 width: '240px',
                                 paddingTop: '10px',
                              }}
                           >
                              <Dropdown
                                 type="single"
                                 variant="revamp"
                                 typeName="cuisine"
                                 defaultName={
                                    state.cuisine === null ? '' : state.cuisine
                                 }
                                 addOption={quickCreateCuisine}
                                 options={cuisineNames}
                                 searchedOption={searchedCuisineOption}
                                 selectedOption={changeCuisine}
                                 typeName="cuisine"
                              />
                           </div>
                           <Spacer xAxis size="16px" />
                           <Form.Group>
                              <Form.Stepper
                                 unitText="min"
                                 fieldName="Cooking time:"
                                 id="containers"
                                 name="containers"
                                 value={parseFloat(_state.cookingTime.value)}
                                 onChange={value => {
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'cookingTime',
                                          value: parseFloat(value),
                                       },
                                    })
                                    changeCookingTime(value + '')
                                 }}
                              />
                           </Form.Group>
                        </Flex>
                        <Spacer size="50px" />
                        <Flex container>
                           <Form.Group>
                              <Form.Text
                                 id="author"
                                 name="author"
                                 variant="revamp-sm"
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'author',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 onBlur={e => {
                                    changeAuthor(e.target.value)
                                 }}
                                 value={_state.author.value}
                                 placeholder="Enter author name"
                                 hasError={
                                    _state.author.meta.isTouched &&
                                    !_state.author.meta.isValid
                                 }
                              />
                              {_state.author.meta.isTouched &&
                                 !_state.author.meta.isValid &&
                                 _state.author.meta.errors.map(
                                    (error, index) => (
                                       <Form.Error key={index}>
                                          {error}
                                       </Form.Error>
                                    )
                                 )}
                           </Form.Group>
                           <Spacer xAxis size="16px" />
                           {/* <Form.Group>
                              <Form.Label
                                 htmlFor="cookingTime"
                                 title="cookingTime"
                              >
                                 <Flex container alignItems="center">
                                    Cooking Time(mins)
                                    <Tooltip identifier="recipe_cooking_time" />
                                 </Flex>
                              </Form.Label>
                              <Form.Number
                                 id="cookingTime"
                                 name="cookingTime"
                                 value={_state.cookingTime.value}
                                 placeholder="Enter cooking time"
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'cookingTime',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 onBlur={() => {
                                    const { isValid, errors } =
                                       validator.cookingTime(
                                          _state.cookingTime.value
                                       )
                                    _dispatch({
                                       type: 'SET_ERRORS',
                                       payload: {
                                          field: 'cookingTime',
                                          meta: {
                                             isTouched: true,
                                             isValid,
                                             errors,
                                          },
                                       },
                                    })
                                 }}
                                 hasError={
                                    _state.cookingTime.meta.isTouched &&
                                    !_state.cookingTime.meta.isValid
                                 }
                              />
                              {_state.cookingTime.meta.isTouched &&
                                 !_state.cookingTime.meta.isValid &&
                                 _state.cookingTime.meta.errors.map(
                                    (error, index) => (
                                       <Form.Error key={index}>
                                          {error}
                                       </Form.Error>
                                    )
                                 )}
                           </Form.Group> */}
                        </Flex>
                        <Spacer size="50px" />
                        <Form.Group>
                           <Form.Text
                              id="utensils"
                              name="utensils"
                              variant="revamp-sm"
                              onChange={e => {
                                 _dispatch({
                                    type: 'SET_VALUE',
                                    payload: {
                                       field: 'utensils',
                                       value: e.target.value,
                                    },
                                 })
                                 const { isValid, errors } = validator.csv(
                                    e.target.value
                                 )
                                 _dispatch({
                                    type: 'SET_ERRORS',
                                    payload: {
                                       field: 'utensils',
                                       meta: {
                                          isTouched: true,
                                          isValid,
                                          errors,
                                       },
                                    },
                                 })
                              }}
                              onBlur={e => {
                                 if (_state.utensils.meta.isValid) {
                                    changeUtensils(e.target.value)
                                 } else {
                                    toast.error('Invalid values!')
                                 }
                              }}
                              value={_state.utensils.value}
                              placeholder="enter utensils used"
                              hasError={
                                 _state.utensils.meta.isTouched &&
                                 !_state.utensils.meta.isValid
                              }
                           />
                           {_state.utensils.meta.isTouched &&
                              !_state.utensils.meta.isValid &&
                              _state.utensils.meta.errors.map(
                                 (error, index) => (
                                    <Form.Error key={index}>{error}</Form.Error>
                                 )
                              )}
                        </Form.Group>
                        <Spacer size="20px" />
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Pan, Spoon, Bowl"
                        />
                        <Spacer size="50px" />
                        <Form.Group>
                           <Form.Text
                              id="notIncluded"
                              name="notIncluded"
                              variant="revamp-sm"
                              onChange={e => {
                                 _dispatch({
                                    type: 'SET_VALUE',
                                    payload: {
                                       field: 'notIncluded',
                                       value: e.target.value,
                                    },
                                 })
                                 const { isValid, errors } = validator.csv(
                                    e.target.value
                                 )
                                 _dispatch({
                                    type: 'SET_ERRORS',
                                    payload: {
                                       field: 'notIncluded',
                                       meta: {
                                          isTouched: true,
                                          isValid,
                                          errors,
                                       },
                                    },
                                 })
                              }}
                              onBlur={e => {
                                 if (_state.notIncluded.meta.isValid) {
                                    changeNotIncluded(e.target.value)
                                 } else {
                                    toast.error('Invalid values!')
                                 }
                              }}
                              value={_state.notIncluded.value}
                              placeholder="what's not included"
                              hasError={
                                 _state.notIncluded.meta.isTouched &&
                                 !_state.notIncluded.meta.isValid
                              }
                           />
                           {_state.notIncluded.meta.isTouched &&
                              !_state.notIncluded.meta.isValid &&
                              _state.notIncluded.meta.errors.map(
                                 (error, index) => (
                                    <Form.Error key={index}>{error}</Form.Error>
                                 )
                              )}
                        </Form.Group>
                        <Spacer size="20px" />
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Salt, Oil, Pepper"
                        />
                        <Spacer size="50px" />
                        <Form.Group>
                           <Form.TextArea
                              id="description"
                              name="description"
                              onChange={e =>
                                 _dispatch({
                                    type: 'SET_VALUE',
                                    payload: {
                                       field: 'description',
                                       value: e.target.value,
                                    },
                                 })
                              }
                              noBorder
                              style={{ padding: '0px' }}
                              value={_state.description.value}
                              onBlur={e => {
                                 changeDescription(e.target.value)
                              }}
                              placeholder="Add Recipe Description in 120 words"
                           />
                        </Form.Group>
                     </>
                  ) : (
                     <Filler
                        message="No cuisines found! To start, add some."
                        height="500px"
                     />
                  )}
               </>
            )}
            <Banner id="products-app-recipes-create-recipe-basic-information-tunnel-bottom" />
         </Flex>
      </>
   )
}

export default Information

const initialState = {
   type: {
      value: 'Vegetarian',
   },
   cuisine: {
      value: '',
   },
   cookingTime: {
      value: '30',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   author: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   notIncluded: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   utensils: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   description: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
}

const reducer = (state, { type, payload }) => {
   switch (type) {
      case 'SEED': {
         return {
            ...state,
            ...payload.state,
         }
      }
      case 'SET_VALUE': {
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               value: payload.value,
            },
         }
      }
      case 'SET_ERRORS': {
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               meta: payload.meta,
            },
         }
      }
      default:
         return state
   }
}
