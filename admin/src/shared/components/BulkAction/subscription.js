import gql from 'graphql-tag'

export const CUISINES_NAMES = gql`
   subscription Cuisines {
      cuisineNames {
         id
         title: name
      }
   }
`
export const INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE = gql`
   subscription IngredientCategoryIngredientsAggregate {
      ingredientCategories {
         name
         title: name
         ingredients_aggregate {
            aggregate {
               count
               description: count
            }
         }
      }
   }
`
