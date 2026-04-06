function initRulesCarousel() {
  const carousel = document.querySelector("[data-rules-carousel]");
  const track = document.querySelector("[data-rules-track]");
  const modal = document.querySelector("[data-rule-modal]");

  if (!track || !modal) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".rule-card"));
  const modalTitle = document.getElementById("rule-modal-title");
  const modalImage = document.getElementById("rule-modal-image");
  const modalContent = document.getElementById("rule-modal-content");
  const closeTargets = modal.querySelectorAll("[data-rule-modal-close]");
  let swiper = null;
  const imagePreloadCache = new Map();
  const HOVER_SLIDE_DELAY_MS = 180;

  const backImageByGame = {
    "Ô Ăn Quan": "../assets/images/mat-sau/o-an-quan.png",
    "Đánh đu": "../assets/images/mat-sau/danh-du.png",
    "Đi cà kheo": "../assets/images/mat-sau/di-ca-kheo.png",
    "Kéo cưa lừa xẻ": "../assets/images/mat-sau/keo-cua-lua-xe.png",
    "Rồng rắn lên mây": "../assets/images/mat-sau/rong-ran-len-may.png",
    "Đập niêu đất": "../assets/images/mat-sau/dap-nieu-dat.png",
    "Đẩy gậy": "../assets/images/mat-sau/day-gay.png",
    "Ném còn": "../assets/images/mat-sau/nem-con.png",
    "Nu na nu nống": "../assets/images/mat-sau/nu-na-nu-nong.png",
    "Nhảy sạp": "../assets/images/mat-sau/nhay-sap.png",
    "Nhảy bao bố": "../assets/images/mat-sau/nhay-bao-bo.png",
    "Mèo đuổi chuột": "../assets/images/mat-sau/meo-duoi-chuot.png",
    "Cướp cờ": "../assets/images/mat-sau/cuop-co.png",
    "Cá sấu lên bờ": "../assets/images/mat-sau/ca-sau-len-bo.png",
    "Chơi chuyền": "../assets/images/mat-sau/choi-chuyen.png",
    "Chi chi chành chành": "../assets/images/mat-sau/chi-chi-chanh-chanh.png",
    "Bịt mắt bắt dê": "../assets/images/mat-sau/bit-mat-bat-de.png",
    "Tàu hỏa": "../assets/images/mat-sau/tau-hoa.png",
    "Thả đỉa ba ba": "../assets/images/mat-sau/tha-dia-ba-ba.png",
  };

  const preloadImage = (src) => {
    if (!src) {
      return Promise.resolve();
    }

    if (imagePreloadCache.has(src)) {
      return imagePreloadCache.get(src);
    }

    const preloadTask = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });

    imagePreloadCache.set(src, preloadTask);
    return preloadTask;
  };

  const primeBackImages = () => {
    const sources = Object.values(backImageByGame);
    sources.forEach((src) => {
      preloadImage(src);
    });
  };

  const openModal = (card) => {
    const cardImage = card.querySelector(".rule-image");
    const gameName = (cardImage && cardImage.alt ? cardImage.alt.trim() : "") || card.dataset.title || "Chi tiet luat choi";
    const backImagePath = backImageByGame[gameName];

    modalTitle.textContent = gameName;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    if (modalImage) {
      modalImage.alt = `Mat sau the luat choi ${gameName}`;

      if (backImagePath) {
        modalImage.classList.remove("is-ready");
        modalImage.onload = () => {
          modalImage.classList.add("is-ready");
        };
        modalImage.onerror = () => {
          modalImage.classList.remove("is-ready");
        };
        modalImage.src = backImagePath;
        modalImage.hidden = false;
        modalContent.hidden = true;

        preloadImage(backImagePath);
      } else {
        modalImage.removeAttribute("src");
        modalImage.classList.remove("is-ready");
        modalImage.hidden = true;
        modalContent.textContent = card.dataset.detail || "Chua co anh mat sau cho the nay.";
        modalContent.hidden = false;
      }
    }
  };

  const closeModal = () => {
    if (modalImage) {
      modalImage.classList.remove("is-ready");
    }
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  const bindCardActions = () => {
    cards.forEach((card, index) => {
      const slide = card.closest(".swiper-slide");
      let hoverTimer = null;

      if (slide) {
        slide.addEventListener("pointerenter", () => {
          if (!swiper || window.innerWidth < 768 || swiper.activeIndex === index) {
            return;
          }

          hoverTimer = window.setTimeout(() => {
            if (swiper && swiper.activeIndex !== index) {
              swiper.slideTo(index, 500);
            }
          }, HOVER_SLIDE_DELAY_MS);
        });

        slide.addEventListener("pointerleave", () => {
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
        });
      }

      card.addEventListener("click", () => {
        const isActive = Boolean(slide && slide.classList.contains("swiper-slide-active"));

        if (isActive) {
          openModal(card);
        }
      });
    });
  };

  closeTargets.forEach((target) => target.addEventListener("click", closeModal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.hasAttribute("data-rule-modal-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  if (window.Swiper && carousel) {
    swiper = new Swiper(carousel, {
      loop: false,
      centeredSlides: true,
      slidesPerView: 3,
      speed: 500,
      spaceBetween: 0,
      threshold: 14,
      touchRatio: 0.72,
      longSwipesRatio: 0.38,
      longSwipesMs: 300,
      watchSlidesProgress: true,
      slideToClickedSlide: false,
      grabCursor: true,
      allowTouchMove: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
          centeredSlides: true,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 3,
          centeredSlides: true,
          spaceBetween: 0,
        },
      },
    });

    bindCardActions();

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        primeBackImages();
      });
    } else {
      setTimeout(() => {
        primeBackImages();
      }, 700);
    }

    window.addEventListener("load", () => {
      swiper.update();
      swiper.slideTo(1, 0);
    });
  }
}

function initOanTuTiGame() {
  const game = document.querySelector("[data-rps-game]");

  if (!game) {
    return;
  }

  const playerScoreEl = document.getElementById("player-score");
  const cpuScoreEl = document.getElementById("cpu-score");
  const drawScoreEl = document.getElementById("draw-score");
  const roundResultEl = document.getElementById("round-result");
  const roundNoteEl = document.getElementById("round-note");

  const duelUserCardEl = document.getElementById("duel-user-card");
  const duelCpuCardEl = document.getElementById("duel-cpu-card");
  const duelUserWrap = document.getElementById("duel-user-wrap");
  const duelCpuWrap = document.getElementById("duel-cpu-wrap");

  const restartBtn = document.getElementById("restart-round");
  const overlay = document.getElementById("game-overlay");
  const playAgainBtn = document.getElementById("play-again");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverMessage = document.getElementById("game-over-message");

  const playerCards = Array.from(game.querySelectorAll(".choice-card"));
  const cardBack = "../oan tu xi/card_back.png";
  const cardByChoice = {
    keo: "../oan tu xi/keo.png",
    bua: "../oan tu xi/bua.png",
    bao: "../oan tu xi/bao.png",
  };

  const choiceLabel = {
    keo: "Kéo",
    bua: "Búa",
    bao: "Bao",
  };

  const winAgainst = {
    keo: "bao",
    bua: "keo",
    bao: "bua",
  };

  const CPU_REVEAL_DELAY_MS = 600;
  const ROUND_RESET_DELAY_MS = 900;

  let playerScore = 0;
  let cpuScore = 0;
  let drawScore = 0;
  let isRoundLocked = false;
  let isGameOver = false;

  function randomChoice() {
    const choices = Object.keys(cardByChoice);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function setAllCardsBack() {
    playerCards.forEach((btn) => {
      const choice = btn.dataset.choice;
      const img = btn.querySelector("img");
      img.src = cardByChoice[choice];
      btn.classList.remove("is-selected");
    });
    duelUserCardEl.src = cardBack;
    duelCpuCardEl.src = cardBack;
  }

  function updateScoreUI() {
    playerScoreEl.textContent = String(playerScore);
    cpuScoreEl.textContent = String(cpuScore);
    drawScoreEl.textContent = String(drawScore);
  }

  function setCardsDisabled(disabled) {
    playerCards.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function revealPlayerCards(selectedChoice) {
    playerCards.forEach((btn) => {
      const choice = btn.dataset.choice;
      const img = btn.querySelector("img");
      img.src = cardByChoice[choice];
      btn.classList.toggle("is-selected", choice === selectedChoice);
    });
  }

  function runDuelAnimation() {
    duelUserWrap.classList.remove("is-fighting");
    duelCpuWrap.classList.remove("is-fighting");
    duelCpuWrap.classList.remove("is-thrown");

    void duelUserWrap.offsetWidth;
    void duelCpuWrap.offsetWidth;

    duelCpuWrap.classList.add("is-thrown");
    duelUserWrap.classList.add("is-fighting");
    duelCpuWrap.classList.add("is-fighting");
  }

  function getRoundOutcome(playerChoice, cpuChoice) {
    if (playerChoice === cpuChoice) {
      return "draw";
    }

    return winAgainst[playerChoice] === cpuChoice ? "player" : "cpu";
  }

  function showGameOver() {
    isGameOver = true;
    setCardsDisabled(true);

    if (playerScore >= 3) {
      gameOverTitle.textContent = "Chúc mừng bạn!";
      gameOverMessage.textContent = "Bạn đã thắng chung cuộc với 3 hiệp thắng.";
    } else {
      gameOverTitle.textContent = "Rất tiếc!";
      gameOverMessage.textContent = "Máy đã thắng chung cuộc. Hãy thử lại nhé.";
    }

    overlay.hidden = false;
  }

  function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    drawScore = 0;
    isRoundLocked = false;
    isGameOver = false;
    overlay.hidden = true;

    updateScoreUI();
    setAllCardsBack();
    setCardsDisabled(false);

    roundResultEl.textContent = "Hãy chọn thẻ để bắt đầu trận đấu.";
    roundNoteEl.textContent = "Bạn cần thắng 3 hiệp để chiến thắng.";
  }

  function playRound(playerChoice, selectedButton) {
    if (isRoundLocked || isGameOver) {
      return;
    }

    isRoundLocked = true;
    setCardsDisabled(true);

    revealPlayerCards(playerChoice);
    roundNoteEl.textContent = `Bạn đã chọn: ${choiceLabel[playerChoice]}. Đang chờ máy ra thẻ...`;

    const cpuChoice = randomChoice();
    duelUserCardEl.src = cardByChoice[playerChoice];
    duelCpuCardEl.src = cardByChoice[cpuChoice];
    selectedButton.classList.add("is-selected");

    runDuelAnimation();

    window.setTimeout(() => {
      const outcome = getRoundOutcome(playerChoice, cpuChoice);

      if (outcome === "player") {
        playerScore += 1;
        roundResultEl.textContent = `Bạn thắng hiệp này! ${choiceLabel[playerChoice]} thắng ${choiceLabel[cpuChoice]}.`;
      } else if (outcome === "cpu") {
        cpuScore += 1;
        roundResultEl.textContent = `Máy thắng hiệp này! ${choiceLabel[cpuChoice]} thắng ${choiceLabel[playerChoice]}.`;
      } else {
        drawScore += 1;
        roundResultEl.textContent = `Hòa hiệp! Cả hai cùng ra ${choiceLabel[playerChoice]}.`;
      }

      updateScoreUI();
      roundNoteEl.textContent = `Tỉ số hiện tại: Bạn ${playerScore} - ${cpuScore} Máy.`;

      if (playerScore >= 3 || cpuScore >= 3) {
        showGameOver();
        isRoundLocked = false;
        return;
      }

      window.setTimeout(() => {
        setAllCardsBack();
        setCardsDisabled(false);
        isRoundLocked = false;
      }, ROUND_RESET_DELAY_MS);
    }, CPU_REVEAL_DELAY_MS);
  }

  playerCards.forEach((button) => {
    button.addEventListener("click", () => {
      const playerChoice = button.dataset.choice;
      playRound(playerChoice, button);
    });
  });

  restartBtn.addEventListener("click", resetGame);
  playAgainBtn.addEventListener("click", resetGame);

  resetGame();
}

document.addEventListener("DOMContentLoaded", function () {
  initRulesCarousel();
  initOanTuTiGame();
});
