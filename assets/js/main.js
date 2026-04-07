function initRulesCarousel() {
  const carousel = document.querySelector("[data-rules-carousel]");
  const track = document.querySelector("[data-rules-track]");
  const modal = document.querySelector("[data-rule-modal]");

  if (!track || !modal) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".rule-card"));
  const modalTitle = document.getElementById("rule-modal-title");
  const modalFlipCard = document.getElementById("rule-flip-card");
  const modalFrontImage = document.getElementById("rule-modal-front-image");
  const modalBackImage = document.getElementById("rule-modal-back-image");
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

    if (modalFlipCard && modalFrontImage && modalBackImage) {
      modalFlipCard.classList.remove("is-flipped");
      modalFrontImage.src = cardImage ? cardImage.src : "";
      modalFrontImage.alt = `Mat truoc the luat choi ${gameName}`;

      if (backImagePath) {
        modalBackImage.alt = `Mat sau the luat choi ${gameName}`;
        modalBackImage.src = backImagePath;
        modalFlipCard.hidden = false;
        modalContent.hidden = true;

        const startFlip = () => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              modalFlipCard.classList.add("is-flipped");
            });
          });
        };

        if (modalBackImage.complete) {
          startFlip();
        } else {
          modalBackImage.onload = startFlip;
          modalBackImage.onerror = () => {
            modalFlipCard.classList.remove("is-flipped");
          };
        }

        preloadImage(backImagePath);
      } else {
        modalBackImage.removeAttribute("src");
        modalFlipCard.hidden = true;
        modalContent.textContent = card.dataset.detail || "Chua co anh mat sau cho the nay.";
        modalContent.hidden = false;
      }
    }
  };

  const closeModal = () => {
    if (modalFlipCard) {
      modalFlipCard.classList.remove("is-flipped");
    }

    if (modalBackImage) {
      modalBackImage.onload = null;
      modalBackImage.onerror = null;
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
  const cardBack = "../oan tu xi/cardback.jpg";
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
  const CARD_FLIP_DURATION_MS = 420;
  const MAX_ROUNDS = 3;

  let playerScore = 0;
  let cpuScore = 0;
  let drawScore = 0;
  let roundCount = 0;
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
    duelUserWrap.classList.remove("is-flipping");
    duelCpuWrap.classList.remove("is-flipping");
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

  function flipRevealDuelCard(cardEl, wrapEl, nextSrc) {
    wrapEl.classList.remove("is-flipping");
    cardEl.src = cardBack;
    void wrapEl.offsetWidth;

    wrapEl.classList.add("is-flipping");

    window.setTimeout(() => {
      cardEl.src = nextSrc;
    }, Math.floor(CARD_FLIP_DURATION_MS / 2));

    window.setTimeout(() => {
      wrapEl.classList.remove("is-flipping");
    }, CARD_FLIP_DURATION_MS + 30);
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
    const completedRounds = roundCount;

    if (playerScore > cpuScore) {
      gameOverTitle.textContent = "Người chơi chiến thắng!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, Người chơi thắng ${playerScore}-${cpuScore}.`;
    } else if (cpuScore > playerScore) {
      gameOverTitle.textContent = "Cao thủ dân gian chiến thắng!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, Cao thủ dân gian thắng ${cpuScore}-${playerScore}.`;
    } else {
      gameOverTitle.textContent = "Hòa chung cuộc!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, hai bên bất phân thắng bại (${playerScore}-${cpuScore}).`;
    }

    overlay.hidden = false;
  }

  function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    drawScore = 0;
    roundCount = 0;
    isRoundLocked = false;
    isGameOver = false;
    overlay.hidden = true;

    updateScoreUI();
    setAllCardsBack();
    setCardsDisabled(false);

    roundResultEl.textContent = "Hãy chọn thẻ để bắt đầu trận đấu.";
    roundNoteEl.textContent = `Thi đấu ${MAX_ROUNDS} vòng: ai nhiều hiệp thắng hơn sẽ thắng.`;
  }

  function playRound(playerChoice, selectedButton) {
    if (isRoundLocked || isGameOver) {
      return;
    }

    isRoundLocked = true;
    setCardsDisabled(true);

    revealPlayerCards(playerChoice);
    roundNoteEl.textContent = `Người chơi đã chọn: ${choiceLabel[playerChoice]}. Đang chờ Cao thủ dân gian ra thẻ...`;

    const cpuChoice = randomChoice();
    flipRevealDuelCard(duelUserCardEl, duelUserWrap, cardByChoice[playerChoice]);
    flipRevealDuelCard(duelCpuCardEl, duelCpuWrap, cardByChoice[cpuChoice]);
    selectedButton.classList.add("is-selected");

    runDuelAnimation();

    window.setTimeout(() => {
      const outcome = getRoundOutcome(playerChoice, cpuChoice);
      roundCount += 1;

      if (outcome === "player") {
        playerScore += 1;
        roundResultEl.textContent = `Người chơi thắng vòng này! ${choiceLabel[playerChoice]} thắng ${choiceLabel[cpuChoice]}.`;
      } else if (outcome === "cpu") {
        cpuScore += 1;
        roundResultEl.textContent = `Cao thủ dân gian thắng vòng này! ${choiceLabel[cpuChoice]} thắng ${choiceLabel[playerChoice]}.`;
      } else {
        drawScore += 1;
        roundResultEl.textContent = `Hòa vòng! Cả hai cùng ra ${choiceLabel[playerChoice]}.`;
      }

      updateScoreUI();
      roundNoteEl.textContent = `Vòng ${roundCount}/${MAX_ROUNDS} • Tỉ số: Người chơi ${playerScore} - ${cpuScore} Cao thủ dân gian.`;

      const remainingRounds = MAX_ROUNDS - roundCount;
      const scoreGap = Math.abs(playerScore - cpuScore);
      const hasDecisiveWinner = scoreGap > remainingRounds;

      if (roundCount >= MAX_ROUNDS || hasDecisiveWinner) {
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

function initOriginTimelineHalfFlow() {
  const timeline = document.querySelector(".folk-timeline");

  if (!timeline) {
    return;
  }

  const stage1 = timeline.querySelector(".timeline-card--left:not(.timeline-card--final)");
  const stage2 = timeline.querySelector(".timeline-card--right");
  const stage3 = timeline.querySelector(".timeline-card--final");
  const center = timeline.querySelector(".folk-timeline__center");

  if (!stage1 || !stage2 || !stage3) {
    return;
  }

  const DESKTOP_BREAKPOINT = 640;
  const FLOW_GAP_FACTOR = 0.48;

  const resetLayout = () => {
    timeline.classList.remove("is-half-flow");
    stage2.style.marginTop = "";
    stage3.style.marginTop = "";
    timeline.style.minHeight = "";
  };

  const applyHalfFlow = () => {
    if (window.innerWidth <= DESKTOP_BREAKPOINT) {
      resetLayout();
      return;
    }

    timeline.classList.add("is-half-flow");

    const stage2Top = Math.max(18, Math.round(stage1.offsetHeight * FLOW_GAP_FACTOR));
    const stage3Top = Math.max(18, Math.round(stage2Top + stage2.offsetHeight * FLOW_GAP_FACTOR));

    stage2.style.marginTop = `${stage2Top}px`;
    stage3.style.marginTop = `${stage3Top}px`;

    const leftBottom = stage3Top + stage3.offsetHeight;
    const rightBottom = stage2Top + stage2.offsetHeight;
    const centerBottom = center ? center.offsetHeight : 0;
    timeline.style.minHeight = `${Math.ceil(Math.max(leftBottom, rightBottom, centerBottom) + 8)}px`;
  };

  applyHalfFlow();

  let resizeRaf = 0;
  window.addEventListener("resize", () => {
    if (resizeRaf) {
      window.cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = window.requestAnimationFrame(() => {
      applyHalfFlow();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initRulesCarousel();
  initOanTuTiGame();
  initOriginTimelineHalfFlow();
});
