import React from "react";
import { Flex } from "@dailykit/ui";
import { Wrapper } from "./styles";

export const GoodiesWrapper = ({ children }) => <Wrapper>{children}</Wrapper>;

export const Ingredients = ({ options, title }) => {
  return (
    <>
      {options?.map((option) => {
        return (
          <div key={option.id}>
            <h1 className="sub-heading">{title}</h1>
            <div className="ingredients_grid">
              {option?.simpleRecipeYield?.simpleRecipe?.simpleRecipeIngredients.map(
                (ingredient) => {
                  return (
                    <div
                      key={ingredient?.ingredient?.id}
                      className="goodiesImgWrapper"
                    >
                      <img
                        className="goodiesImg"
                        src={ingredient?.ingredient?.image}
                        alt=""
                      />
                      <p className="goodieName">
                        {ingredient?.ingredient?.name}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
export const Goodies = ({ products, title, secondTitle }) => {
  console.log(products, "llll");
  return (
    <GoodiesWrapper>
      {products.map((product) => {
        return (
          <div key={product?.id}>
            <h1 className="sub-heading">{title}</h1>
            <img
              className="box-open-img"
              src="https://dailykit-239-primanti.s3.us-east-2.amazonaws.com/images/kits/Updated+Box+Image.png"
              alt="open-box-img"
            />
            <Ingredients
              options={product?.productOptions}
              title={secondTitle}
            />
          </div>
        );
      })}
    </GoodiesWrapper>
  );
};
