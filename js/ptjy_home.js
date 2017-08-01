var app = angular.module('ptjyHome', []);

app.controller('ptjyHomeController', function($rootScope, $scope, $http, $compile) {

  getControllerMethod ($rootScope, $scope, $http, $compile);

  //电子签约是否显示
  $scope.isDZQYShow = isDZQYShow;
  // 新股申购是否显示
  $scope.isXGSGShow = isXGSGShow;
  //交割单查询
  $scope.isJGDCXShow = isJGDCXShow;
  //港股通
  $scope.isGGTShow = isGGTShow;
  // 是否显示交易登录页的顶部登录按钮区域
  $scope.isShowTopLoginBtn = isShowTopLoginBtn;
  //收益凭证
  $scope.isSYPZShow = isSYPZShow;
  //网络投票
  $scope.isWLTPShow = isWLTPShow;

  //资金调度是否显示
  $scope.isZJDDShow = isZJDDShow;

  //ETF是否显示
  $scope.isETFShow = isETFShow;
  //LOF是否显示
  $scope.isLOFShow = isLOFShow;
  //分级基金是否显示
  $scope.isFJJJShow = isFJJJShow;
  //个股期权是否显示
  $scope.isGGQQShow = isGGQQShow;
  //权证行权是否显示
  $scope.isQZXQShow = isQZXQShow;
  //质押回购是否显示
  $scope.isZYHGShow = isZYHGShow;
  //股份转让是否显示
  $scope.isGFZRShow = isGFZRShow;
  //转股回售是否显示
  $scope.isZGHSShow = isZGHSShow;
  //要约收购是否显示
  $scope.isYYSGShow = isYYSGShow;
  //小额贷是否显示
  $scope.isXEDShow = isXEDShow;
  // 未登录首页，点击功能菜单，登录成功后，跳转到功能页面去 2016.12.01 add
  $scope.isRedirectJump = isRedirectJump;


  var isLoginLogShow = false;
  var loginLog = getLocalData ("loginLog_ptjy");
  if (loginLog) {
    loginLog = JSON.parse (loginLog);
    $scope.loginLogDate = loginLog.date;
    $scope.loginLogTime = loginLog.time;
    isLoginLogShow = true;
    removeLocalData("loginLog_ptjy");
  }
  $scope.isLoginLogShow = isLoginLogShow;

  // 交易首页风格选择
  $scope.JYStyle = JYInterfaceStyle;
  if ($scope.JYStyle === 1) {
    $(function(){
      $("#style2").remove();
    });
  }else {
    $(function(){
      $("#style1").remove();
    })
  }

  $scope.onLoginLogClick = function(){
    $("#loginLogInfo").hide(300);
    //$scope.isLoginLogShow = false;
  }

  // 清除持仓 行情 买入 卖出界面设置的证券代码信息
  if (getLocalData("zqdm")) {
    removeLocalData("zqdm");
  }


  if (document.title.trim() == "普通交易首页") {
    $scope.isShowExitButton = false;
  } else {
    $scope.isShowExitButton = true;
  }

  $scope.userAgent = navigator.userAgent;

  if ($("body").hasClass("ptjy-header")) {

    // 点击登录 快捷菜单项 主菜单项跳转到登录页
    $("body").delegate("#login, .ul-main > li, .ul-column > li", "click", function() {
      var pageText = $(this).children("a").children("label").text().trim();
      setLocalData("page",pageText);
      if (!getIsRegister()) {
        showAlert("请先进行手机号码注册。", "提示信息", true);
        return;
      } else {
        // 如果存在快捷跳转, 就删除快捷跳转标识
        if (getLocalData("quickJump")) {
          removeLocalData("quickJump");
        }

        // 重定向功能初始化（条件满足才执行）2016.12.01 add
        if(isRedirectJump == true){
          REDIRECT.init();
        }

        //判断点击的是个股期权，进入个股期权首页
        if(pageText == '个股期权'){
          JumpInterface("ggqq/home/home.html", 8, 1);
        }else{
          // 4-- 隐藏返回按钮  1-- 跳转到下一界面
          JumpInterface(params["viewKey"].KDS_PTJYLogin, 4, 1);
        }

      }

    });

  } else if ($("body").hasClass("ptjy-index")) {

    try {
      setTimeout(function(){
        ZJCX();
      },100);
    } catch (error) {
      console.log("普通交易 - 资金查询异常! ", error);
    }

    try {
      MultiAccountInit("ptjy");
    } catch (error) {
      console.log("普通交易 - 多账号初始化异常! ", error);
    }

    $scope.Ensure = function() {
      Logout();
    }

    $("body").delegate(".ul-main > li,.ul-column > li", "click", function() {
      setLocalData("page", $(this).children("a").children("label").text().trim());

      //=============普通买卖快捷菜单======================
      if ($("body").hasClass("ptjy-index") == true) {
        var jumpParams = getJumpInterfaceParams();
        if(jumpParams[0] != null) {
          JumpInterface(jumpParams[0], jumpParams[1], jumpParams[2]);
        }
      }
    });

    $(document).ready(function() {
      var idName = "#owl-demo" + JYInterfaceStyle;
      $(idName).owlCarousel({
        autoPlay: false,
        items: 1
      });
    });

    // 绑定多账号切换事件
    bindMultiUserSwitchEvent();
  }

});

//渲染完毕，调用
app.directive('onPtjyFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      $timeout(function () {
        changeItemName();
      },50);
    }
  }
});

//改变项名称
function changeItemName(){
  if (isAppointedCompony(ZQGS_HUALONGXINBAN)) {
    //资金调度(华龙新版，菜单名称为"资金归集")
    $("#zjddName").text("资金归集");
    //“交割单查询”改为“交割单”
    $("#jgdcx").text("交割单");
    //收益凭证(华龙新版，菜单名称为"华龙理财")
    $("#sypzName").text("华龙理财");
    //”电子签约“改为“风险测评”
    $("#dzqy").text("风险测评");
    $("#sypzImg").attr("src", "../../../images/pic_hllc.svg")
  }
};

function onPTJYLogout(){
  var modal = {};

  modal["title"] = "退出确认";

  if ($("body").hasClass("ptjy-index") == true) {
    modal["msg"] = [{
      value: "确定要退出当前交易账号?"
    }];
  } else if ($("body").hasClass("rzrq-index") == true) {
    modal["msg"] = [{
      value: "确定要退出当前信用交易账号?"
    }];
  } else {
    console.log("普通交易 - 退出当前交易账号出现异常！");
    return;
  }
  angular.element($("body")).scope().$apply(function() {
    create_modal(controller["scope"], controller["compile"], modal);
  });
};

function gotoPTJYPage(title){
  $("#loginLogInfo").hide();
  if (title == "买入") {
    JumpInterface(params.viewKey.KDS_Buy, 8, 1);
  } else if (title == "卖出") {
    JumpInterface(params.viewKey.KDS_Sell, 8, 1);
  } else if (title == "撤单") {
    JumpInterface(params.viewKey.KDS_CheDan, 0, 1);
  } else if (title == "查询") {
    JumpInterface(params.viewKey.KDS_Query, 8, 1);
  } else if (title == "银证转账") {
    JumpInterface(params.viewKey.KDS_SM_YZZZ, 0, 1);
  } else if (title == "资金调度"  || title == "资金归集") {
    JumpInterface(params.viewKey.KDS_PTJY_ZJDD, 0, 1);
  } else if (title == "新股申购") {
    JumpInterface(params.viewKey.KDS_SM_XGSG, 0, 1);
  } else if (title == "开放式基金") {
    // 恒生接口还未支持风险测评
    if (params['jybblx'] == "tongyong") {
      JumpInterface(params.viewKey.KDS_KFSJJ_Index, 8, 1);
    } else {
      // 开发式基金需要进行风险测评后才能进行交易
      checkAgreement(params.viewKey.KDS_KFSJJ_Index);
    }
  } else if (title == "ETF基金") {
    JumpInterface("etf/home/home.html", 8, 1);
  } else if (title == "LOF基金") {
    JumpInterface("lof/home/home.html", 8, 1);
  } else if (title == "分级基金") {
    JumpInterface("fjjj/home/home.html", 8, 1);
  } else if (title == "个股期权") {
    JumpInterface("ggqq/home/home.html", 8, 1);
  } else if (title == "质押回购") {
    JumpInterface("zqzy/home/home.html", 8, 1);
  }else if (title == "港股通") {
    JumpInterface("ggt/home/home.html", 0, 1);
  } else if (title == "收益凭证" || title == "华龙理财") {
    JumpInterface("sypz/home/home.html", 0, 1);
  } else if (title == "网络投票") {
    JumpInterface("wltp/home/home.html", 0, 1);
  }else if (title == "交割单查询" || title == "交割单") {
    var url = "ptjy/jgdcx/jgdcx.html";
    JumpInterface(url, 8, 1);
  }else if (title == "股份转让") {
    JumpInterface("gfzr/home/home.html", 8, 1);
  } else if (title == "上海报价回购") {
    //JumpInterface("etf/home/lof_login.html",0,1);
  } else if (title == "深圳报价回购") {
    //JumpInterface("etf/home/lof_login.html",0,1);
  } else if (title == "密码修改") {
    JumpInterface(params.viewKey.KDS_PTJY_XGMM, 8, 1);
  } else if (title == "电子签约" || title == "风险测评") {
    JumpInterface(params.viewKey.KDS_DZQY_LIST, 0, 1);
  } else if (title == "转股回售") {
    JumpInterface("ptjy/zghs/zghs.html", 8, 1);
  } else if (title == "要约收购") {
    JumpInterface("ptjy/yysg/yysg.html", 8, 1);
  } else if (title == "小额贷") {
    JumpInterface("xed/home/home.html", 8, 1);
  }
}

function getJumpInterfaceParams(){
  $("#loginLogInfo").hide();
  var title = getLocalData("page");
  if (title == "买入") {
    return[params.viewKey.KDS_Buy, 8, 1];
  } else if (title == "卖出") {
    return[params.viewKey.KDS_Sell, 8, 1];
  } else if (title == "撤单") {
    return[params.viewKey.KDS_CheDan, 0, 1];
  } else if (title == "查询") {
    return[params.viewKey.KDS_Query, 8, 1];
  } else if (title == "银证转账") {
    return[params.viewKey.KDS_SM_YZZZ, 0, 1];
  } else if (title == "资金调度"  || title == "资金归集") {
    return[params.viewKey.KDS_PTJY_ZJDD, 0, 1];
  } else if (title == "新股申购") {
    return[params.viewKey.KDS_SM_XGSG, 0, 1];
  } else if (title == "开放式基金") {
    return[params.viewKey.KDS_KFSJJ_Index, 8, 1];
  } else if (title == "ETF基金") {
    return["etf/home/home.html", 8, 1];
  } else if (title == "LOF基金") {
    return["lof/home/home.html", 8, 1];
  } else if (title == "分级基金") {
    return["fjjj/home/home.html", 8, 1];
  } else if (title == "个股期权") {
    return["ggqq/home/home.html", 8, 1];
  } else if (title == "权证行权") {
    return["ptjy/qzxq/qzxq.html", 8, 1];
  } else if (title == "质押回购") {
    return["zqzy/home/home.html", 8, 1];
  }else if (title == "港股通") {
    return["ggt/home/home.html", 0, 1];
  } else if (title == "收益凭证" || title == "华龙理财") {
    return["sypz/home/home.html", 0, 1];
  } else if (title == "网络投票") {
    return["wltp/home/home.html", 0, 1];
  }else if (title == "交割单查询" || title == "交割单") {
    var url = "ptjy/jgdcx/jgdcx.html";
    return[url, 8, 1];
  }else if (title == "股份转让") {
    return["gfzr/home/home.html", 8, 1];
  } else if (title == "上海报价回购") {
    //return["etf/home/lof_login.html",0,1];
  } else if (title == "深圳报价回购") {
    //return["etf/home/lof_login.html",0,1];
  } else if (title == "密码修改") {
    return[params.viewKey.KDS_PTJY_XGMM, 8, 1];
  } else if (title == "电子签约" || title == "风险测评") {
    return[params.viewKey.KDS_DZQY_LIST, 0, 1];
  } else if (title == "转股回售") {
    return["ptjy/zghs/zghs.html", 8, 1];
  } else if (title == "要约收购") {
    return["ptjy/yysg/yysg.html", 8, 1];
  } else if (title == "小额贷") {
    return["xed/home/home.html", 8, 1];
  }

  return [null, null, null];
}


//跳转到开放式基金（判断是否已经答题测评，没有的话，先答题测评）
function judgeToFunds() {
    if (isAppointedCompony(ZQGS_HUALONGXINBAN)) { //华龙证券登录的时候，统一做测评处理，此处不再测评
        //在未登录的情况下，不做开放式基金跳转处理(ptjy_header界面)

        var loginElement = document.getElementById('login') || null;
        if (loginElement) {
          return [params.viewKey.KDS_KFSJJ_Index, 8, 1];
        }

        //在登录的情况下，做开放式基金跳转处理(ptjy_index界面)
        var FXCP = JSON.parse(getLocalData("FXCP")) || [];
        var ACTIVE_USER = JSON.parse(getLocalData("ActivePTJYUser")).head.khbz || null;
        var fxcpjg, unSign, overTwoYears;

        if (FXCP.length>0) {
          for(var i=0, len=FXCP.length; i<len; i++){
            if (ACTIVE_USER === FXCP[i].khh) {
              fxcpjg = FXCP[i].fxcpjg;
              unSign = FXCP[i].unSign;
              overTwoYears = FXCP[i].overTwoYears;
            }
          }
        }

        if (fxcpjg === "success") {
          return [params.viewKey.KDS_KFSJJ_Index, 8, 1];
        } else if (fxcpjg === "fail") {
          if ("-1" === unSign) {
            JumpInterface(params.viewKey.KDS_DZQY_FXCP_START, 8, 1);
          } else if (overTwoYears < 0) {
            JumpInterface(params.viewKey.KDS_DZQY_RISK_OVERDUE, 8, 1);
          }
        }

    } else {

        if (getLocalData("ActivePTJYUser")) {
            //客户属性（“0”：个人  “1”：机构）
            var cpdcbbh = JSON.parse(getLocalData("ActivePTJYUser"))["body"]["dlxx"][0].khsx == "0" ? "3" : "4";
            ajaxPost(getApiUrl() + "ptjy/cwkfsjj/jjkhfxcx", {
                cpdcbbh: cpdcbbh
            }, function(response) {

                //fxdj(风险等级(-1:未做风险测评))  fxdjsm(风险等级说明)  cpdf(测评得分)  cprq(测评日期)  qyzhlx(签约账
                var info = response.fhxx;
                var pageUrl = params.viewKey.KDS_DZQY_RISK_START;
                if (info && info.length > 0) {
                    info = info[0];
                    if ("-1" != info.fxdj.toString()) { //已经签约过
                        pageUrl = params.viewKey.KDS_KFSJJ_Index;
                    }
                }
                JumpInterface(pageUrl, 8, 1);
            }, null, {
                isloaddingrunNoEvent: true
            });
        } else {
            console.log("普通交易用户信息丢失");
        }
    }

    return [null, null, null];
};

/**
 * 判断是否已经答题测评，没有的话，先答题测评
 * @param  {string} des 目标跳转地址
 * @return {[type]}     [description]
 */
function checkAgreement(des) {
    if (getLocalData("ActivePTJYUser")) {
      //客户属性（“0”：个人  “1”：机构）
      var cpdcbbh = JSON.parse(getLocalData("ActivePTJYUser"))["body"]["dlxx"][0].khsx == "0" ? "3" : "4";
      ajaxPost(getApiUrl() + "ptjy/cwkfsjj/jjkhfxcx", {
        cpdcbbh: cpdcbbh
      }, function (response) {

        //fxdj(风险等级(-1:未做风险测评))  fxdjsm(风险等级说明)  cpdf(测评得分)  cprq(测评日期)  qyzhlx(签约账
        var info = response.fhxx;
        if (info && info.length > 0) {
          info = info[0];
          if ("-1" != info.fxdj.toString()) { //已经签约过
            // 检测签约状态是否超过有效期
            checkAgreementIsOverdue(des);
          } else {
            JumpInterface(params.viewKey.KDS_DZQY_RISK_START, 8, 1);
          }
        } else {
          JumpInterface(params.viewKey.KDS_DZQY_RISK_START, 8, 1);
        }
      }, null, {isloaddingrunNoEvent: true});
    } else {
      console.log("普通交易用户信息丢失");
    }
};
/**
 * 检查评测时间是否在有效日期内
 * @param  {string} des 目标跳转地址
 * @return {[type]}     [description]
 */
function checkAgreementIsOverdue(des) {
    var isAccessable = true; //默认已经测评通过
    var param = {};
    ajaxPost(getApiUrl() + "ptjy/zhyw/fxcpjgcx", param,
        function (response) {

        var info = response.fhxx;
        if (info && info.length > 0) {
            //客户号,khh  预约流水号,yylsh  试题编码,stbm 测试评分,cspf  评级级别,pjjb  级别名称,jbmc  评级日期,pjrq   有效日期,yxrq   系统日期,xtsj
            info = info[0];
            if("-1" == info.pjjb.toString()){ // 未签约
                isAccessable = false;
            }else{
                var sYxrq = info.yxrq;
                var yxrq = new Date(sYxrq.substring(0,4),sYxrq.substring(4,6),sYxrq.substring(6,8));
                var sXtsj = info.xtsj;
                var xtsj = new Date(sXtsj.substring(0,4),sXtsj.substring(4,6),sXtsj.substring(6,8));
                if(yxrq.getTime() - xtsj.getTime() < 0){ //超过两年
                    isAccessable = false;
                }
            }
        }
        if(isAccessable){
            // 有效期内，跳转到目标地址
            JumpInterface(des, 8, 1);
        }else{
            // 超过有效期，跳转到风险测评页面
            JumpInterface(params.viewKey.KDS_DZQY_RISK_OVERDUE, 8, 1);
        }
    });
}

app.directive('ptjymenu', function() {
  return {
    restrict: 'E',
    templateUrl: "ptjy_menu.html",
    replace: true
  };
});

/**
 * 原生 APP 回调函数, 用于刷新页面数据。
 */
function handlePageBack() {
  if (getlasthref().indexOf("ptjy_header.html") >= 0) {
    console.log("普通交易未登录首页不需要进行资金查询！");
    return;
  }

  ZJCX();
}

$(window).load(function () {
    setTimeout(function () {
      changeItemName();
    }, 200);
});
