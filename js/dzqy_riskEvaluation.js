//风险测评答题
var app = angular.module("dzqyRiskEvaluation", []);

app.controller("dzqyRiskEvaluationController", ["$scope", "QuestionList", function (scope, questionList) {
    var data;
    // 如果是华龙新版，需要用新的解析协议
    if (isAppointedCompony(ZQGS_HUALONGXINBAN)) {
        data = requestQuestionsSpecial(scope, questionList);
    } else {
        data = requestQuestions(scope, questionList);
    }

    scope.onCellCheck = function (item, index) {
        //客观题不容许手动改变答案19
        if (item.banCheck) {
            return;
        }
        var styles = questionList.styles;
        var checkInfo = item.checkInfo;
        var list = item.list;
        var styleIndex = item.isMultiple ? 1 : 0;
        if (item.isMultiple) {
            checkInfo[index] = !checkInfo[index];
        } else {
            checkInfo[index] = true;
            //将其他制为不选
            for (var i = 0; i < list.length; i++) {
                if (i != index) {
                    list[i].style = styles[styleIndex][0];
                    checkInfo[i] = false;
                }
            }
        }
        list[index].style = styles[styleIndex][checkInfo[index] == true ? 1 : 0];
    };

    //提交数据
    scope.onBtnClick = function () {
        var data = scope.data;
        var checkInfo;
        var isAllAnswer;
        for (var i = 0; i < data.length; i++) {
            checkInfo = data[i].checkInfo;
            isAllAnswer = false;
            for (var j = 0; j < checkInfo.length; j++) {
                if (checkInfo[j] == true) {
                    isAllAnswer = true;
                    break;
                }
            }
            if (!isAllAnswer) {
                showAlert("第 " + data[i].itemId + " 题没有回答，请回答后提交。", "提示")
                return;
            }
        }

        //在做完风险测评后把fxcpjg字段改为success
        var FXCP = JSON.parse(getLocalData("FXCP")) || [];
        var ACTIVE_USER = JSON.parse(getLocalData("ActivePTJYUser")).head.khbz || null;
        var fxcpjg;

        if (FXCP.length>0) {
          for(var i=0, len=FXCP.length; i<len; i++){
            if (ACTIVE_USER === FXCP[i].khh) {
             FXCP[i].fxcpjg = "success";
             FXCP.splice(i, 1, {"khh": FXCP[i].khh, "fxcpjg": FXCP[i].fxcpjg,  "unSign": FXCP[i].unSign, "overTwoYears": FXCP[i].overTwoYears});
            }
          }
          //先把旧的账户数组标识移除
          removeLocalData("FXCP");
          //再把新的账户数组赋予标识
          setLocalData("FXCP", FXCP);
        }

        var result = getSubmitData(questionList);

        // 如果是华龙新版，需要使用新的接口提交数据
        if (isAppointedCompony(ZQGS_HUALONGXINBAN)) {
            // 添加作答状态字段
            var zdztArr = [];
            zdztArr.push('0');
            for (var k=0; k < data.length - 2; k++) {
                zdztArr.push('1');
            }
            zdztArr.push('2');
            result.zdztStr = zdztArr.join('|');

            submitAnswersSpecial(result);
        } else {
            submitAnswers(result);
        }
    };

    scope.$watch('$viewContentLoaded', function () {
        var totalHeight = document.documentElement.clientHeight;
        var bottomHeight = document.getElementById("buttomButton").clientHeight;
        scope.topHeightStyle = "height:" + (totalHeight - bottomHeight) + "px";
    });
}]);

app.service("QuestionList", ["$rootScope", function (rootScope) {
    var styles = [["inputSingleUnselected", "inputSingleSelected"],
        ["inputMultipleUnselected", "inputMultipleSelected"]];
    var service = {
        data: [],
        dic: {},
        styles: styles
    };
    return service;
}]);

//获取提交数据
function getSubmitData(questionList) {
    var dic = questionList.dic;
    var value = questionList.data;
    var numStr = "", selectedStr = "", scoreStr = "";
    var checkInfo, scoreArr, data, list;
    var tempJ = -1;
    var finalScore = 0;
    for (var i = 0, len = value.length; i < len; i++) {
        data = value[i];
        numStr += data.itemId;
        checkInfo = data.checkInfo;
        scoreArr = dic[data.itemId].score;
        list = data.list;
        tempJ = -1;
        for (var j = 0, jLen = checkInfo.length; j < jLen; j++) {
            if (checkInfo[j] == true) {
                if (tempJ != -1) {
                    selectedStr += ",";
                    scoreStr += ",";
                }
                selectedStr += list[j].wordIndex;
                scoreStr += scoreArr[j];
                finalScore += parseInt(scoreArr[j]);
                tempJ = j;
            }
        }
        if (i != len - 1) {
            numStr += "|";
            selectedStr += "|";
            scoreStr += "|";
        }
    }
    return {numStr: numStr, selectedStr: selectedStr, scoreStr: scoreStr, finalScore: finalScore};
};

//请求试题
function requestQuestions(scope, questionList) {
    //客户属性（“0”：个人  “1”：机构）
    var cpdcbbh = JSON.parse(getLocalData("ActivePTJYUser"))["body"]["dlxx"][0].khsx == "0" ? "3" : "4";
    var param = {
        "cpywbz": "1",//,//业务标识  0: { Name: 经纪业务客户风险评估问卷 }   1: { Name: 开放式基金业务客户风险评估问卷 }
        "cpdcbbh": cpdcbbh,//调查表编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "cpstzkgsx": "0"//主客观属性  0: { Name: 客观(选择题) }   1: { Name: 主观 }
    };
    ajaxPost(getApiUrl() + "ptjy/dzqy/fxcpstcx", param, function (response) {
        //dxdx(单选多选)   tmbh(题目编号)  tmnr(题目内容) xxbh(选项编号) xxbz(选项备注) xxdf(选项得分) xxnr(选项内容)
        var fhxx = response.fhxx || [];
        var info = dealQuestion(fhxx, questionList.styles);

        questionList.data = info.result;
        questionList.dic = info.dic;
        scope.data = info.result;
    });
}

//请求华龙新版的测试题
function requestQuestionsSpecial(scope, questionList) {
    //客户属性（“0”：个人  “1”：机构）
    var cpdcbbh = JSON.parse(getLocalData("ActivePTJYUser"))["body"]["dlxx"][0].khsx == "0" ? "3" : "4";
    var param = {
        tmlb: "3",
        khsx: "0"
    };
    ajaxPost(getApiUrl() + "ptjy/zhyw/hqfxcpst", param, function (response) {
        //dxdx(单选多选)   tmbh(题目编号)  tmnr(题目内容) xxbh(选项编号) xxbz(选项备注) xxdf(选项得分) xxnr(选项内容)
        var stlb = response.stlb || [];
        var info = dealQuestionSpecial(stlb, questionList.styles);

        window.dzqy_stlz = stlb[0].stlz;    // 试题栏目
        window.dzqy_stbh = stlb[0].stbh;    // 试题编号

        questionList.data = info.result;
        questionList.dic = info.dic;
        scope.data = info.result;
    });
}

function dealQuestion(questions, styles) {
    //dxdx(单选多选)   tmbh(题目编号)  tmnr(题目内容) xxbh(选项编号) xxbz(选项备注) xxdf(选项得分) xxnr(选项内容)
    //[{dxdx: "0", tmbh: "1", tmnr: "您目前所处的年龄阶段", xxbh: "a", xxbz: "", xxdf: "5", xxnr: "30岁以下"}]

    var result = [], dic = {};
    var item, list, score, checkInfo, index, multipleIntValue;
    for (var i = 0, len = questions.length; i < len; i++) {
        que = questions[i];
        item = dic[que.tmbh];
        if (!item) {
            item = {
                itemId: que.tmbh,//题目Z编号
                title: que.tmbh + "、" + que.tmnr,//题目内容
                isMultiple: "1" == que.dxdx.toString() ? true : false //单选多选(0:单选 1:多选)
            }
            index = 0;
            result.push(item);
            dic[que.tmbh] = item;
            item.list = list = [];
            item.score = score = [];
            item.checkInfo = checkInfo = [];
            multipleIntValue = item.isMultiple ? 1 : 0;
        }
        score.push(que.xxdf);
        checkInfo.push(false);
        list.push({
            index: index,
            wordIndex: que.xxbh,
            name: que.xxbh.toUpperCase() + " " + que.xxnr,
            remark: que.remark,
            style: styles[multipleIntValue][0]
        });
        index++;
    }
    //        itemId: 3,
    //        title: "3、德玛西亚",
    //        isMultiple: 0,
    //        list: [{name: "皇子", index: 0, style: styles[0][0]}, {name: "盖伦", index: 1, style: styles[0][0]}, {
    //            name: "赵信",
    //            index: 2,
    //            style: styles[0][0]
    //        }],
    //        checkInfo: [false, false, false],
    //        score: [10, 20, 30]
    //    }
    return {result: result, dic: dic};
}
// 华龙新版题目提取
function dealQuestionSpecial(questions, styles) {
    //xxlx(单选多选)   tmbh(题目编号)  stnr(题目内容) xxbh(选项编号) xxbz(选项备注) xxdf(选项得分) xxnr(选项内容)
    //[{xxlx: "0", tmbh: "1", stnr: "您目前所处的年龄阶段", xxbh: "a", xxbz: "", xxdf: "5", xxnr: "30岁以下"}]

    var result = [], dic = {};
    var item, list, score, checkInfo, index, multipleIntValue, kgtIndex, banCheck;
    for (var i = 0, len = questions.length; i < len; i++) {
        que = questions[i];
        item = dic[que.tmbh];
        if (!item) {
            item = {
                itemId: que.tmbh,//题目Z编号
                title: que.tmbh + "、" + que.stnr,//题目内容
                isMultiple: "1" == que.xxlx.toString() ? true : false, //单选多选(0:单选 1:多选)
                banCheck: que.stlx === '0' ? true : false,   //客观题
            }
            index = 0;
            result.push(item);
            dic[que.tmbh] = item;
            item.list = list = [];
            item.score = score = [];
            item.checkInfo = checkInfo = [];
            multipleIntValue = item.isMultiple ? 1 : 0;
        }
        kgtIndex = (que.stlx === '0' && parseInt(que.kgtda) === (index+1)) ? '1' : '0';
        score.push(que.xxdf);
        //客观题默认选中具体项
        if (parseInt(que.kgtda) === (index+1)) {
            checkInfo.push(true);
        } else {
            checkInfo.push(false);
        }
        list.push({
            index: index,
            wordIndex: que.xxbh,
            name: que.xxbh.toUpperCase() + " " + que.xxnr,
            remark: que.remark,
            style: styles[multipleIntValue][kgtIndex]
        });
        index++;
    }
    return {result: result, dic: dic};
}

//提交答案
function submitAnswers(result) {
    //客户属性（“0”：个人  “1”：机构）
    var cpdcbbh = JSON.parse(getLocalData("ActivePTJYUser"))["body"]["dlxx"][0].khsx == "0" ? "3" : "4";
    var param = {
        //业务标识  0: { Name: 经纪业务客户风险评估问卷 }   1: { Name: 开放式基金业务客户风险评估问卷 }
        "cpywbz": "1",
        //调查表编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "cpdcbbh": cpdcbbh,
        //题目编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "tmbh": result.numStr,
        //选项编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "xxbh": result.selectedStr,
        //选项得分  0: { Name: 客观(选择题) }   1: { Name: 主观 }
        "xxdf": result.scoreStr,
        //选项得分合计
        "xxdfhj": result.finalScore.toString()
    };
    ajaxPost(getApiUrl() + "ptjy/dzqy/fxcpsttj", param, function (response) {
        var fhxx = response.fhxx;
        if (fhxx && fhxx.length > 0) {
            var info = fhxx[0];
            //khfxdj(客户风险等级)   khfxdjsm(客户风险等级说明)  cpdf(测评得分) cprq(测评日期)
            var key = "dzqy-evluation-score";
            var data = {khfxdj: info.khfxdj, khfxdjsm: info.khfxdjsm, cpdf: info.cpdf, cprq: info.cprq};
            setLocalData(key, data)
            JumpInterface(params.viewKey.KDS_DZQY_RISK_RESULT, 8, 0);
        }
    });
};

//华龙新版提交答案
function submitAnswersSpecial(result) {
    debugger
    var param = {
        "dcbbm": "3",
        "dcblz": dzqy_stlz,
        //题目编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "dcblm": result.numStr,
        //选项编号 1: { Name: 个人经纪业务风险评估问卷 }  2: { Name: 机构经纪业务风险评估问卷 } 3: { Name: 个人基金账户风险评估问卷 } 4: { Name: 机构基金账户风险评估问卷 }
        "dcbdy": result.selectedStr,
        "zdzt": result.zdztStr
    };
    ajaxPost(getApiUrl() + "ptjy/zhyw/fxcpdt", param, function (response) {
        var fhxx = response.fhxx;
        if (fhxx && fhxx.length > 0) {
            var info = fhxx[0];
            //khfxdj(客户风险等级)   khfxdjsm(客户风险等级说明)  cpdf(测评得分) cprq(测评日期)
            var key = "dzqy-evluation-score";
            var data = {khfxdj: info.pjjb, khfxdjsm: info.pjjbmc, cpdf: info.jcfz, cprq: info.cprq};
            setLocalData(key, data)
            JumpInterface(params.viewKey.KDS_DZQY_RISK_RESULT, 8, 0);
        }
    });
};

