import styled from 'styled-components'

export const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #223a5f;
  padding: 20px;
`
export const RulesView = styled.div`
  align-self: flex-end;
  margin-top: auto;
  @media screen and (max-width: 576px) {
    margin-bottom: 40px;
  }
`
export const PopUpView = styled.div`
  display: flex;
  flex-direction: column;
  height: 40vw;
  justify-content: space-between;
  padding: 10px;
  @media screen and (max-width: 576px) {
    height: 260px;
    width: 100%;
  }
`
export const PopUpImage = styled.img`
  width: 100%;
  height: 90%;
  margin-top: auto;
`
export const PlayButton = styled.button`
  width: 150px;
  height: 150px;
  background-color: transparent;
  border-style: none;
  outline: none;
  @media screen and (max-width: 576px) {
    width: 100px;
    height: 100px;
    margin-top: 0px;
    margin-right: 20px;
  }
`
export const PlayImage = styled.img`
  width: 150px;
  height: 150px;
  @media screen and (max-width: 576px) {
    width: 100px;
    height: 100px;
  }
`
export const HighLightName = styled.h1`
  color: white;
  font-size: 20px;
  font-family: 'Bree Serif';
  margin-top: 0px;
  margin-bottom: 0px;
  @media screen and (max-width: 576px) {
    font-size: 14px;
  }
`

export const HighLightTitle = styled.h1`
  color: white;
  font-size: 25px;
  font-family: 'Bree Serif';
  margin-top: 0px;
  margin-bottom: 0px;
  @media screen and (max-width: 576px) {
    font-size: 14px;
  }
`

export const ScoreImage = styled.img`
  width: 50px;
  height: 50px;
  @media screen and (max-width: 576px) {
    width: 30px;
    height: 30px;
  }
`

export const TableCentered = styled.table`
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`
