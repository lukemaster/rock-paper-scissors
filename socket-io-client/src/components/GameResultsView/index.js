import {
  GameViewContainer,
  GameButton,
  GameImage,
  ResultImageContainer,
  ResultName,
  ResultText,
} from './styledComponents'

import './index.css'

const GameResultsView = props => {
  const {
    choicesList,
    showResults,
    newArray,
    playAgain,
    sendChoice,
    attempingResults,
    result,
    finalScore,
    showFinalScore,
  } = props

  const showGame = () => (
    <GameViewContainer>
      {!showResults &&
        ((!attempingResults && (
          <>
            <GameButton
              type="button"
              data-testid="rockButton"
              onClick={() => {
                sendChoice(choicesList[0].id)
              }}
            >
              <GameImage
                src={choicesList[0].imageUrl}
                alt={choicesList[0].id}
                key={choicesList[0].id}
              />
            </GameButton>
            <GameButton
              type="button"
              data-testid="scissorsButton"
              onClick={() => {
                sendChoice(choicesList[1].id)
              }}
            >
              <GameImage
                src={choicesList[1].imageUrl}
                alt={choicesList[1].id}
                key={choicesList[1].id}
              />
            </GameButton>
            <GameButton
              type="button"
              data-testid="paperButton"
              onClick={() => {
                sendChoice(choicesList[2].id)
              }}
            >
              <GameImage
                src={choicesList[2].imageUrl}
                alt={choicesList[2].id}
                key={choicesList[2].id}
              />
            </GameButton>
          </>
        )) ||
          (attempingResults && (
            <>
              <ResultText>
                ATTEMPING RESULTS FROM THE OTHER PLAYER(S)
                <br />
                PLEASE WAIT{' '}
              </ResultText>
            </>
          )))}
      {showResults && (
        <>
          <ResultImageContainer>
            <ResultName>YOU</ResultName>
            <GameImage
              src={choicesList[newArray[0]].imageUrl}
              alt="your choice"
            />
          </ResultImageContainer>
          <ResultImageContainer>
            <ResultName>OPPONENT</ResultName>
            <GameImage
              src={choicesList[newArray[1]].imageUrl}
              alt="opponent choice"
            />
          </ResultImageContainer>
          <ResultImageContainer>
            <ResultText>
              {result != null &&
                ((result && <>YOU WON</>) || (!result && <>YOU LOSE</>))}
              {result == null && <>IT IS DRAW</>}
            </ResultText>
            {!finalScore && (
              <button
                className="result-button"
                type="button"
                onClick={() => {
                  playAgain()
                }}
              >
                PLAY AGAIN
              </button>
            )}
            {finalScore && (
              <button
                className="result-button"
                type="button"
                onClick={() => {
                  showFinalScore()
                }}
              >
                SHOW RESULTS
              </button>
            )}
          </ResultImageContainer>
        </>
      )}
    </GameViewContainer>
  )
  return showGame()
}

export default GameResultsView
