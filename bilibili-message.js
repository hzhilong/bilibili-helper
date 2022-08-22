// ==UserScript==
// @name         Bilibili 消息清理助手
// @namespace    https://github.com/hzhilong/bilibili-helper/
// @version      0.1
// @description  快速清空哔哩哔哩个人消息通知（“回复我的”、“@ 我的”，“收到的赞”）。使用方法：点击消息页面右下角按钮即可。
// @author       hzhilong
// @match        https://message.bilibili.com/*
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    // 参考脚本：https://www.tore.moe/post/bilibili-massage-cleaner
    //   目前（2022年8月22日）好像使用不了。

    const urlPattern =
        /^https?:\/\/message\.bilibili\.com\/.*#\/(reply|love|at)$/;
    const urlPatternReply = /^https?:\/\/message\.bilibili\.com\/.*#\/reply$/;
    const urlPatternAt = /^https?:\/\/message\.bilibili\.com\/.*#\/at$/;
    const urlPatternLove = /^https?:\/\/message\.bilibili\.com\/.*#\/love$/;

    const sleep = (fn, ms) => {
        if (fn === undefined || fn === null) {
            fn = () => {};
        }
        return new Promise((resolve) => {
            setTimeout(() => resolve(fn()), ms);
        });
    };

    let replyList;
    let loveList;
    let clearBtn = null;
    let isCleaning = false;

    const clearMessage = async () => {
        let delBtn;
        let failedCount = 0;
        let delCount = 0;

        let scrollPane = document.querySelector(".space-right-bottom");
        let routerPanel = scrollPane.querySelector(".router-view");

        while (isCleaning && failedCount < 4) {
            scrollPane.scrollTop = routerPanel.offsetHeight;
            scrollPane.scrollTop = 0;
            delBtn = document.querySelector(
                ".confirm-popup .bl-button--primary"
            );
            if (delBtn) {
                delBtn.click();
                delCount++;
                failedCount = 0;
            } else {
                failedCount++;
            }
            await sleep(() => {}, 500);
        }

        isCleaning = false;
        refreshDisplayText();
        if (delCount > 0) {
            alert("共清理了" + delCount + "条消息");
        } else {
            alert("当前消息为空");
        }
    };

    const refreshDisplay = () => {
        if (clearBtn === null) {
            return;
        }
        if (urlPattern.test(document.URL)) {
            clearBtn.style.display = "block";
        } else {
            clearBtn.style.display = "none";
        }
    };

    const refreshDisplayText = () => {
        if (isCleaning) {
            clearBtn.innerText = "停止清空消息";
        } else {
            if (urlPatternReply.test(document.URL)) {
                clearBtn.innerText = "清空消息";
            } else if (urlPatternAt.test(document.URL)) {
                clearBtn.innerText = "清空消息";
            } else if (urlPatternLove.test(document.URL)) {
                clearBtn.innerText = "清空通知";
            } else {
                clearBtn.style.display = "none";
            }
        }
    };

    const createClearBtn = () => {
        clearBtn = document.createElement("div");
        refreshDisplayText();
        clearBtn.classList.add("bilibili-message-clear-btn");
        clearBtn.style =
            "color: #FFF;position: absolute;bottom: 10vh;right: 5vw;background: #fb7299;padding: 10px;border-radius: 4px;font-size: 14px;cursor: pointer;user-select: none;";
        refreshDisplay();
        document.body.appendChild(clearBtn);
        clearBtn.addEventListener("click", () => {
            if (isCleaning) {
                isCleaning = !isCleaning;
                refreshDisplayText();
            } else {
                if (document.querySelector(".nothing")) {
                    alert("当前消息为空");
                } else if (confirm("确定清空？")) {
                    isCleaning = !isCleaning;
                    refreshDisplayText();
                    clearMessage();
                }
            }
        });
    };

    const loadScript = async () => {
        console.log("loadScript");
        isCleaning = false;
        if (clearBtn !== null) {
            refreshDisplay();
            refreshDisplayText();
        } else {
            createClearBtn();
        }
    };

    window.onload = () => {
        sleep(()=>{
            let list = document.querySelectorAll(".space-left .list .item");
            list.forEach((item) => {
                if (!item.classList.contains("added-event")) {
                    item.classList.add("added-event");
                    item.addEventListener("click", loadScript);
                }
            });
            console.log(document.URL);
            if (urlPattern.test(document.URL)) {
                loadScript();
            }
        }, 500)
    };
})();
