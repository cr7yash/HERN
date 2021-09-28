import styled from "styled-components";
import { theme } from "../../../../theme";
export const Wrapper = styled.div`
  padding: 1rem;
  .top-heading {
    font-size: ${theme.sizes.h3};
    font-weight: 400;
    color: ${theme.colors.textColor4};
    text-transform: uppercase;
    margin-bottom: 28px;
    text-align: center;
  }
  .heading {
    font-size: ${theme.sizes.h8};
    font-weight: 700;
    color: ${theme.colors.textColor4};
    text-transform: uppercase;
    margin-bottom: 8px;
    text-align: left;
    span {
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.textColor4};
      text-transform: lowercase;
    }
  }
  .sticky-container {
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${theme.colors.mainBackground};
    padding: 16px 0;
  }
  .select-option {
    display: flex;
    border: 1px solid ${theme.colors.textColor4};
    color: ${theme.colors.textColor4};
    border-radius: 4px;
    .select-dates {
      width: 100%;
      color: ${theme.colors.textColor4};
      border: 0;
      background: none;
      cursor: pointer;
      p {
        text-align: left;
      }
      .head {
        font-size: ${theme.sizes.h6};
        font-weight: 600;
      }
    }
    .select-participant {
      width: 100%;
      color: ${theme.colors.textColor4};
      border: 0;
      background: none;
      cursor: pointer;
      position: relative;
      p {
        text-align: left;
      }
      .head {
        font-size: ${theme.sizes.h6};
        font-weight: 600;
      }
    }
  }

  .showAll {
    font-size: ${theme.sizes.h7};
    font-weight: 200;
    font-style: italic;
    color: ${theme.colors.textColor4};
  }
  .calendarSpan {
    background: ${theme.colors.mainBackground};
    box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
      3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
      3px 3px 8px rgba(21, 23, 30, 0.9), inset 1px 1px 2px rgba(45, 51, 66, 0.3),
      inset -1px -1px 2px rgba(21, 23, 30, 0.5);
    border-radius: 4px;
    padding: 8px;
  }
  .breakdown-head {
    background: none;
    border: none;
    font-size: ${theme.sizes.h6};
    font-weight: 700;
    color: ${theme.colors.textColor};
    cursor: pointer;
    margin-bottom: 1rem;
  }
`;

export const Popup = styled.div`
  display: ${({ show }) => (show ? "block" : "none")};
  position: absolute;
  border-radius: 4px;
  left: 0px;
  top: 32px;
  z-index: 10;
  background: ${theme.colors.textColor4};
  .pointer {
    position: absolute;
    pointer-events: none;
    border-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-right: 1px solid rgb(203, 214, 226);
    border-bottom: 1px solid rgb(203, 214, 226);
    border-image: none 100% / 1 / 0 stretch;
    clip-path: polygon(100% 100%, 0px 100%, 100% 0px);
    border-top-left-radius: 100%;
    border-top-color: transparent !important;
    border-left-color: transparent !important;
    width: 15px;
    height: 15px;
    background-color: inherit;
    transform: rotate(-135deg);
    top: -6px;
    left: 16px;
    background: #fff;
  }
`;