const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

//宣告遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
}

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
      `
  },

  getCardElement(index) {
    return `
    <div data-index="${index}" class="card back"></div>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    //回傳正面
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
    //回傳背面

  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score : ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times}`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event =>
        event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//新增Fisher-Yates-Shuffle 洗牌演算法
const utility = {
  getRandomNumber(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//新增Model來存放我們翻牌的動作
const model = {
  revealedCard: [],

  isRevealedCardMatched() {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

//新增controller來操作
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumber(52))
  },
  dispatchCardAction(card) {
    //判斷是否配對成功,點擊事件內的class不包含back布林值為false就不執行
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCard.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        //次數計算
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCard.push(card)
        //判斷是否配對成功
        if (model.isRevealedCardMatched()) {
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCard)
          model.revealedCard = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCard)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('目前狀態:', this.currentState)
    console.log('選取牌的index: ', model.revealedCard.map(card => card.dataset.index))

  }, resetCards() {
    view.flipCards(...model.revealedCard)
    model.revealedCard = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()




//選取所有的card節點 - NodeList 
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
}) 
