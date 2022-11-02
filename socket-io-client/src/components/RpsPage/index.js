import {Component} from 'react'

import Popup from 'reactjs-popup'

import 'reactjs-popup/dist/index.css'

import {RiCloseLine} from 'react-icons/ri'

import ScoreView from '../ScoreView'

import GameResultsView from '../GameResultsView'

import './index.css'

import {
  MainContainer,
  RulesView,
  PopUpView,
  PopUpImage,
} from './styledComponents'

class RpsPage extends Component {
  render() {
    const {
      score,
      choicesList,
      newArray,
      playAgain,
      sendChoice,
      attempingResults,
      result,
      finalScore,
      showFinalScore,
      showResults,
    } = this.props
    return (
      <MainContainer>
        <ScoreView score={score} />
        <GameResultsView
          choicesList={choicesList}
          showResults={showResults}
          newArray={newArray}
          playAgain={playAgain}
          sendChoice={sendChoice}
          attempingResults={attempingResults}
          result={result}
          finalScore={finalScore}
          showFinalScore={showFinalScore}
        />
        <RulesView>
          <Popup
            modal
            trigger={
              <button type="button" className="trigger-button">
                RULES
              </button>
            }
          >
            {close => (
              <PopUpView>
                <button
                  type="button"
                  className="trigger-button-close"
                  onClick={() => close()}
                >
                  <RiCloseLine />
                </button>
                <PopUpImage src="/assets/rules-image.png" alt="rules" />
              </PopUpView>
            )}
          </Popup>
        </RulesView>
      </MainContainer>
    )
  }
}

export default RpsPage
