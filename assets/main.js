let interval_count;
let isCounting = false;

// window.addEventListener("resize", function () {
//   location.reload();
// });

//#region 處理全螢幕放大相關函式
function enterFullscreen() {
  const elem = document.documentElement; // 這裡選擇整個頁面作為進入全螢幕的元素
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    // Chrome, Safari 和 Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    // IE/Edge
    elem.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    // Chrome, Safari 和 Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    // IE/Edge
    document.msExitFullscreen();
  }
}

const fullScreemMode = () => {
  if (!document.fullscreenElement) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
};
//#endregion

function turnScreen_common(turnObjID, objW, objH, direction) {
  var width = $(window).width();
  var heigh = $(window).height();

  var Main_W = objW;
  var Main_H = objH;

  let ScaleX = width / Main_H;
  let ScaleY = heigh / Main_W;

  ScaleSize = ScaleX <= ScaleY ? ScaleX : ScaleY;
  var MoveCntX = 0;
  var MoveCntY = 0;
  var MoveCntY_2 = 0;
  if (ScaleSize == ScaleX) {
    MoveCntX = (width / ScaleSize) * -1;
    MoveCntY = (heigh - Main_W * ScaleSize) / 2 / ScaleSize;
    MoveCntY_2 = ((Main_W * ScaleSize + (heigh - Main_W * ScaleSize) / 2) / ScaleSize) * -1;
  } else {
    MoveCntX = (((width - Main_H * ScaleSize) / 2 + Main_H * ScaleSize) / ScaleSize) * -1;
    MoveCntY = 0;
  }

  $("#" + turnObjID).css("transform-origin", "0 0");
  if (direction.toUpperCase() == "R") {
    $("#" + turnObjID).css("transform", "scale(" + ScaleSize + ") rotate(-90deg) translateX(" + MoveCntY_2 + "px)");
  } else if (direction.toUpperCase() == "L") {
    $("#" + turnObjID).css("transform", "scale(" + ScaleSize + ") rotate(90deg) translateY(" + MoveCntX + "px) translateX(" + MoveCntY + "px)");
  } else {
    let ScaleX = width / Main_W;
    let ScaleY = heigh / Main_H;

    ScaleSize = ScaleX <= ScaleY ? ScaleX : ScaleY;
    if (ScaleSize > 1) ScaleSize = 1;
    $("#" + turnObjID).css("transform-origin", "50% 50%");
    $("#" + turnObjID).css("transform", "scale(" + ScaleSize + ")");
  }

  // $("#" + turnObjID).css("opacity", 1);
}

var iw = $(window).width();
var ih = $(window).height();

if (ih > iw) {
  turnScreen_common("TheTimer", ih, iw, "L");
} else {
  // turnScreen_common("TheTimer", ih, iw, "");
}

$(".time .material-symbols-outlined").click(function (e) {
  e.preventDefault();
  const target = e.target;
  const controlNo = $(target).attr("data-controlNo");
  const isMinus = $(target).hasClass("reverse");
  const parentTarget = $(target).closest(".time");
  const parentID = $(parentTarget).attr("id");

  const changeTarget = $(`.${parentID}Text_${controlNo}`);

  const maxNo = parseInt($(changeTarget).attr("data-maxNo"));
  let nowNo = parseInt($(changeTarget).text());
  let delta = isMinus ? -1 : 1;
  nowNo = nowNo + delta;
  if (nowNo > maxNo) nowNo = 0;
  else if (nowNo < 0) nowNo = maxNo;

  $(changeTarget).text(nowNo);

  let { nowHour, nowMinute, nowSecond } = getNowTime();
  if (nowHour == 24) {
    showNowTime(nowHour, 0, 0);
    $(".time.minute,.time.second").addClass("alerm");
  } else {
    $(".time").removeClass("alerm");
    showNowTime(nowHour, nowMinute, nowSecond);
  }
});

const getNowTime = () => {
  let nowHour = parseInt($(".hourText_1").text() + $(".hourText_2").text());
  let nowMinute = parseInt($(".minuteText_1").text() + $(".minuteText_2").text());
  let nowSecond = parseInt($(".secondText_1").text() + $(".secondText_2").text());

  return { nowHour, nowMinute, nowSecond };
};

const showNowTime = (nowHour, nowMinute, nowSecond) => {
  const hoursArray = `${nowHour}`.padStart(2, "0").split("");
  const minutesArray = `${nowMinute}`.padStart(2, "0").split("");
  const secondArray = `${nowSecond}`.padStart(2, "0").split("");

  if (!nowHour && !nowMinute && !nowSecond) {
    // 沒設定時間不需要計時
    $(".button.start").addClass("disable").removeClass("hide");
    $(".button.pause").addClass("hide");
    $(".button.reset").addClass("hide");
  } else {
    $(".button.start").removeClass("disable");
    $(".button.reset").removeClass("hide");
  }

  $(".hourText_1").text(hoursArray[0]);
  $(".hourText_2").text(hoursArray[1]);
  $(".minuteText_1").text(minutesArray[0]);
  $(".minuteText_2").text(minutesArray[1]);
  $(".secondText_1").text(secondArray[0]);
  $(".secondText_2").text(secondArray[1]);
};

const editTime = (editVal) => {
  // 抓取現在時間
  let { nowHour, nowMinute, nowSecond } = getNowTime();
  // 已經是00:00:00，為下限統一顯示00:00:00
  if (!nowHour && !nowMinute && !nowSecond && editVal < 0) return;
  if (nowHour == 24 && editVal > 0) return;

  // 異動秒數
  nowSecond += editVal;

  if (nowSecond < 0) {
    // 秒數為負數，需要換算給秒數
    if (!nowHour && !nowMinute) {
      showNowTime(0, 0, 0);
      return;
    }

    if (!nowMinute) {
      nowHour -= 1;
      nowMinute += 59;
    } else {
      nowMinute -= 1;
    }
    nowSecond += 60;
  } else {
    // 增加時間
    if (nowSecond >= 60) {
      // 秒數到頂60需要進位
      nowMinute += 1;
      nowSecond -= 60;
      if (nowMinute >= 60) {
        // 分到頂60需要進位
        nowHour += 1;
        nowMinute = 0;
        if (nowHour == 24) {
          // 如果已經到了24小時，為上限統一顯示24:00:00
          showNowTime(nowHour, 0, 0);
          return;
        }
      }
    }
  }

  if (nowHour == 0 && isCounting) {
    $(".time-remaining").addClass("noHours");
  }
  showNowTime(nowHour, nowMinute, nowSecond);
};

const editStartMode = (mode) => {
  $(".start").toggleClass("hide");
  $(".pause").toggleClass("hide");
  $(".divSide.right").find(".button").toggleClass("disable");
  $(".time .material-symbols-outlined").toggleClass("disable");

  isCounting = !isCounting;

  if (mode) {
    // 開始計時
    editTime(-1);
    interval_count = setInterval(() => {
      editTime(-1);
    }, 1000);
  } else {
    clearInterval(interval_count);
  }
};

const reset = () => {
  isCounting = false;
  $(".noHours").removeClass("noHours");
  $(".divSide.right").find(".button").removeClass("disable");
  $(".time .material-symbols-outlined").removeClass("disable");
  showNowTime(0, 0, 0);
  clearInterval(interval_count);
};
