import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 64px);
  filter: ${({ isCelebrating }) => isCelebrating && "blur(4px)"};

  .modal-content-div {
    font-size: ${theme.sizes.h8};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem;
    small {
      font-size: ${theme.sizes.h12};
    }
  }

  .previousBtn {
    margin: 0;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    cursor: pointer;
  }
`;
