import {
  ScoreContainer,
  HighLightNameContainer,
  HighLightName,
  ScoreBoard,
  ScoreHeading,
  ScoreResult,
} from './styledComponents'

const ScoreView = props => {
  const {score} = props
  return (
    <ScoreContainer>
      <HighLightNameContainer>
        <HighLightName>
          ROCK
          <br /> PAPER <br /> SCISSORS
        </HighLightName>
      </HighLightNameContainer>
      <ScoreBoard>
        <ScoreHeading>Score</ScoreHeading>
        <ScoreResult>{score}</ScoreResult>
      </ScoreBoard>
    </ScoreContainer>
  )
}

export default ScoreView
