import {Component} from 'react'
import socketIOClient from 'socket.io-client'
import RpsPage from '../RpsPage'

import './index.css'
import {
  PlayButton,
  PlayImage,
  HighLightName,
  HighLightTitle,
  ScoreImage,
  TableCentered,
  SignupContainer,
} from './styledComponents'

const ENDPOINT = `http://${window.location.hostname}:4001`

class Signup extends Component {
  choicesList = [
    {
      id: 0, // 'PAPER'
      imageUrl: '/assets/paper-image.png',
    },
    {
      id: 1, // 'SCISSORS'
      imageUrl: '/assets/scissor-image.png',
    },
    {
      id: 2, // 'ROCK'
      imageUrl: '/assets/rock-image.png',
    },
  ]

  uuid = ''

  constructor() {
    super()
    this.state = {
      nickname: 'player',
      rounds: 1,
      letsGame: false,
      gameState: 'waiting-game',
      score: 0,
      attempingResults: false,
      showResults: false,
      result: null,
      finalScore: false,
      results: [],
      newArray: [],
    }
  }

  getSocket = null

  componentDidMount() {
    const socket = socketIOClient(ENDPOINT)

    this.getSocket = () => socket

    socket.on('fatal-error', () => {
      this.setState({gameState: 'fatal-error'})
    })

    socket.on('your-uuid', data => {
      this.uuid = data?.uuid
      socket.emit('your-uuid-ACK')
    })

    socket.on('configure-game', () => {
      const {gameState} = this.state
      if (gameState !== 'waiting-game') {
        this.resetPlayer()
      }
      this.setState({gameState: 'configure-game'})
    })
    socket.on('join-game', () => {
      this.setState({gameState: 'join-game'})
    })
    socket.on('result', data => {
      if (data.rounds <= 0) {
        this.setState({finalScore: true})
      }
      this.setState({
        newArray: data.newArray,
        rounds: data.rounds,
        result: data.result,
        showResults: true,
        attempingResults: false,
        score: data.score,
      })
    })
    socket.on('show-final-score', data => {
      const finalScores = {}
      data.finalScore.forEach(round => {
        Object.keys(round.scores).forEach(key => {
          if (finalScores[key] === undefined) {
            finalScores[key] = 0
          }
          finalScores[key] += round.scores[key]
        })
      })
      const myData = data
      myData.finalScores = finalScores
      this.setState({results: myData})
      this.setState({letsGame: false, gameState: 'show-final-score'})
    })
    socket.on('restart-game', () => {
      window.location.reload()
    })
  }

  play = () => {
    const {rounds, gameState, nickname} = this.state
    if (rounds <= 0) {
      return
    }
    const playerInfo = {}
    playerInfo.nickname = nickname
    if (gameState === 'configure-game') {
      playerInfo.rounds = parseInt(rounds)
    }
    this.getSocket().emit('player-info', playerInfo)
    this.setState({letsGame: true})
  }

  roundChanges = e => {
    this.setState({rounds: e.target.value})
  }

  nicknameChanges = e => {
    this.setState({nickname: e.target.value})
  }

  sendChoice = choice => {
    console.log(this.uuid)
    this.getSocket().emit('choice', {
      playerId: this.uuid,
      choice,
    })
    this.setState({attempingResults: true})
  }

  playAgain = () => {
    this.setState({showResults: false})
  }

  showFinalScore = () => {
    this.getSocket().emit('get-final-score')
  }

  restartGame = () => {
    this.setState({gameState: 'waiting-for-restarting-game'})
    this.getSocket().emit('restart-game')
  }

  resetPlayer = () => {
    this.setState({
      nickname: 'player',
      rounds: 1,
      letsGame: false,
      gameState: 'configure-game',
      score: 0,
      attempingResults: false,
      showResults: false,
      result: null,
      finalScore: false,
      results: [],
      newArray: [],
    })
  }

  render() {
    const {
      nickname,
      letsGame,
      gameState,
      results,
      attempingResults,
      score,
      showResults,
      result,
      newArray,
      finalScore,
      rounds,
    } = this.state
    return (
      <>
        {!letsGame && (
          <>
            {gameState === 'fatal-error' && (
              <SignupContainer>
                <HighLightName>
                  ROCK
                  <br />
                  PAPER
                  <br />
                  SCISSORS
                </HighLightName>
                <HighLightName>
                  <br />
                  FATAL ERROR OCCURS. PLEASE, REFRESH THIS PAGE
                </HighLightName>
              </SignupContainer>
            )}
            {gameState === 'waiting-game' && (
              <SignupContainer>
                <HighLightName>
                  ROCK
                  <br /> PAPER <br /> SCISSORS
                </HighLightName>
                <HighLightName>
                  <br />
                  WAITING FOR GAME SETUP
                </HighLightName>
              </SignupContainer>
            )}
            {(gameState === 'join-game' || gameState === 'configure-game') && (
              <SignupContainer>
                <HighLightName>
                  ROCK
                  <br /> PAPER <br /> SCISSORS
                </HighLightName>
                <br />
                <br />
                <HighLightName> Nickname </HighLightName>
                <input
                  type="text"
                  name="nickname"
                  value={nickname}
                  onChange={this.nicknameChanges}
                />
                {gameState === 'configure-game' && (
                  <>
                    <br />
                    <HighLightName> Rounds </HighLightName>
                    <input
                      type="number"
                      name="rounds"
                      min="1"
                      max="10"
                      value={rounds}
                      onChange={this.roundChanges}
                    />
                  </>
                )}
                <br />
                <br />
                <PlayButton
                  type="image"
                  name="continue"
                  alt="play"
                  onClick={this.play}
                >
                  <PlayImage src="https://freeiconshop.com/wp-content/uploads/edd/play-rounded-outline.png" />
                </PlayButton>
              </SignupContainer>
            )}
            {(gameState === 'waiting-for-restarting-game' ||
              gameState === 'show-final-score') && (
              <SignupContainer>
                <HighLightTitle>ROUND&apos;S SCORE</HighLightTitle>
                {results.finalScore.map((round, idx) => (
                  <>
                    <HighLightName>
                      <br />
                      ROUND {idx + 1}
                    </HighLightName>
                    <TableCentered>
                      <tbody>
                        <tr key={round.idx}>
                          {Object.keys(round.choices).map(key => (
                            <td>
                              <table>
                                <tbody>
                                  <tr key="tr-{idx}-1">
                                    <td key="td-{idx}-1">
                                      <HighLightName>{key}</HighLightName>
                                    </td>
                                  </tr>
                                  <tr key="tr-{idx}-2">
                                    <td key="td-{idx}-2">
                                      <ScoreImage
                                        src={
                                          this.choicesList[round.choices[key]]
                                            .imageUrl
                                        }
                                        alt={
                                          this.choicesList[round.choices[key]]
                                            .id
                                        }
                                        key={
                                          this.choicesList[round.choices[key]]
                                            .id
                                        }
                                      />
                                    </td>
                                  </tr>
                                  <tr key="tr-{idx}-3">
                                    <td key="td-{idx}-3">
                                      <HighLightName>
                                        {round.results[key] && <> WON</>}
                                        {round.results[key] != null &&
                                          !round.results[key] && <> LOST</>}
                                        {round.results[key] == null && (
                                          <> IT IS DRAW</>
                                        )}
                                      </HighLightName>
                                    </td>
                                  </tr>
                                  <tr key="tr-{idx}-4">
                                    <td key="td-{idx}-4">
                                      <HighLightName>
                                        {round.scores[key]}
                                      </HighLightName>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </TableCentered>
                  </>
                ))}
                <HighLightTitle>FINAL SCORE</HighLightTitle>
                <TableCentered>
                  <tbody>
                    <tr>
                      {Object.keys(results.finalScores).map(key => (
                        <td key={key}>
                          <table>
                            <tbody>
                              <tr key="tr-{idx}{key}-1">
                                <td key="td-{idx}{key}-1">
                                  <HighLightName>{key}</HighLightName>
                                </td>
                              </tr>
                              <tr key="tr-{idx}{key}-2">
                                <td key="td-{idx}{key}-2">
                                  <HighLightName>
                                    {results.finalScores[key]}
                                  </HighLightName>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </TableCentered>
                {gameState !== 'waiting-for-restarting-game' && (
                  <button type="button" onClick={this.restartGame}>
                    Reset game
                  </button>
                )}
                {gameState === 'waiting-for-restarting-game' && (
                  <HighLightTitle>
                    WAITING WHILE ALL PLAYERS ARE READY FOR GAMING AGAIN...
                  </HighLightTitle>
                )}
              </SignupContainer>
            )}
          </>
        )}
        {letsGame && (
          <RpsPage
            choicesList={this.choicesList}
            sendChoice={this.sendChoice}
            score={score}
            attempingResults={attempingResults}
            playAgain={this.playAgain}
            showResults={showResults}
            result={result}
            newArray={newArray}
            finalScore={finalScore}
            showFinalScore={this.showFinalScore}
          />
        )}
      </>
    )
  }
}

export default Signup
