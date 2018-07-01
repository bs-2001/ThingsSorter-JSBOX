var spaces=new Array()
var storage=new Array()
var spacesShow=new Array()

var allSpaces = $cache.get("spaces")
var allThings = $cache.get("things")
if (!allThings) {
  allThings=new Array()
}
prepareData()


function prepareData() {
  spaces=new Array()
  if (allSpaces) {
    allSpaces.map(function(space) {
      spaces.push({
        label: {
          text: space.sID
        }
      })
    })
  }
  else {
    allSpaces=new Array()
  }
  spacesShow = spaces.concat ([{
    label: {
      text: "[+新储物空间]"
    }
  }])
  storage=new Array()
}

function drawIt() {
  $ui.render({
    id: "main",
    props: {
      title: "放哪儿了"
    },
    views: [
      {
        type: "button",
        props: {
          title: "寻找"
        },
        layout: function(make) {
          make.right.top.inset(10)
          make.size.equalTo($size(120, 40))
        },
        events: {
          tapped: function(sender) {
            searchItem()
          }
        }
      },
      {
        type: "input",
        id: "kwField",
        props: {
          placeholder: "您在找什么？"
        },
        layout: function(make) {
          make.top.left.inset(10)
          make.right.equalTo($("button").left).offset(-10)
          make.height.equalTo($("button"))
        },
        events: {
          returned: function(sender) {
            searchItem()
          }
        }
      },
      {
        type: "matrix",
        props: {
          data: spacesShow,
          columns: 3,
          itemHeight: 60,
          spacing: 5,
          square: true,
          selectable: true,
          template: {
            props: {},
            views: [
              {
                type: "label",
                props: {
                  id: "label",
                  bgcolor: $color("#eeeeee"),
                  textColor: $color("#333333"),
                  align: $align.center,
                  font: $font(16),
                  autoFontSize: true
                },
                layout: $layout.fill
              }
            ]
          }
        },
        events: {
          didSelect: function(sender, indexPath, sel) {
            var sID = sel.label.text
            showSpace(sID)
          }
        },
        layout: function(make) {
          make.left.bottom.right.equalTo(0)
          make.top.equalTo($("input").bottom).offset(10)
        }
      },
      {
        type: "label",
        props: {
          //text: "直接点击“寻找”列出全部物品。",
          font: $font(12),
          textColor: $color("#bbbbbb"),
          align: $align.center,
          height: 30
        },
        layout: function(make) {
          make.bottom.inset(10)
          make.centerX.equalTo(0)
        }
      }
    ]
  })
}

function showSpace(sID) {
  if (sID=="[+新储物空间]") {
    createSpace();
    return false
  }
  if (!spaceExists(sID)) {
    $ui.toast("没有这个空间！")
    return false
  }
  else {
    var storageShow = new Array()
    var tmp=storage[sID]
    tmp.map (function(layer, index){
      var layerContent=new Array()
      layer.map(function (itemID, idx){
        layerContent[idx]=allThings[itemID]
      })
      storageShow[index]={
        title: "第"+(index+1)+"层",
        rows: layerContent
      }
    })
  }
  $ui.push({
    props: {
      title: sID
    },
    views: [
      {
        type: "list",
        props: {
          data: storageShow,
          rowHeight: 50,
          actions: [
            {
              title: "移除",
              color: $color("red"),
              handler: function(sender, indexPath) {
                removeItem(sID, indexPath.section, indexPath.row)
              }
            },
            {
              title: "移动",
              color: $color("gray"),
              handler: function(sender, indexPath) {
                moveItem(sID, indexPath.section, indexPath.row)
              }
            },
            {
              title: "改名",
              color: $color("orange"),
              handler: function(sender, indexPath) {
                renameItem(sID, indexPath.section, indexPath.row)
              }
            }
          ],
          header: {
            type: "label",
            props: {
              height: 40,
              text: "   "+"以下物品位于 "+sID,
              textColor: $color("#333333"),
              align: $align.left,
              font: $font(20)
            }
          }
        },       
        layout: function(make, view) {
          make.left.bottom.right.equalTo(0)
          make.top.equalTo($("spaceName").bottom).offset(10)
        }
      },
      {
        type: "button",
        id: "btn1",
        props: {
          title: "放入"
        },
        layout: function(make) {
          make.right.bottom.inset(10)
          make.height.equalTo(40)
          make.width.equalTo(90)
        },
        events: {
          tapped: function(sender) {
            addItem(sID)
          }
        }
      },
      {
        type: "button",
        props: {
          title: "编辑"
        },
        layout: function(make) {
          make.left.bottom.inset(10)
          make.height.equalTo(40)
          make.width.equalTo(90)
        },
        events: {
          tapped: function(sender) {
            renameSpace(sID)
          }
        }
      },
      {
        type: "button",
        props: {
          title: "移除"
        },
        layout: function(make, view) {
          make.bottom.inset(10)
          make.height.equalTo(40)
          make.width.equalTo(90)
          make.centerX.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            removeSpace(sID)
          }
        }
      }
    ]
  })
}

function spaceExists(sID) {
  if (!spaces) {
    return false
  }
  if (storage[sID]) {
    return true
  }
  else {
    var tryLoad=$cache.get("storage_"+sID)
    
    if (!tryLoad) {
      return false
    }
    else {
      storage[sID]=tryLoad
      return true
    }
  }
}

function createSpace() {
  $input.text({
    type: $kbType.text,
    placeholder: "储物空间名称",
    handler: function(text) {
      if (text=='') {
        $ui.alert("名称不能为空。")
      }
      else if (spaceExists(text)) {
        $ui.alert("这个储物空间已经存在了。")
      }
      else {
        $ui.menu({
          items: ["不分层", "分2层", "分3层", "分4层", "分5层", "分6层"],
          handler: function(title, idx) {
            allSpaces.unshift({
              sID: text,
              layer: idx+1
            })
            $cache.set("spaces", allSpaces)
            var tmp=new Array()
            for(var i=0; i<idx+1; i++) {
              tmp[i]=new Array()
            }
            $cache.set("storage_"+text, tmp)
            $("matrix").insert({
              indexPath: $indexPath(0, 0),
              value: {
                label: {
                  text: text
                }
              }
            })
            
            prepareData()
          }
        })
      }
    }
  })
}

function renameSpace(sID) {
  $input.text({
    type: $kbType.text,
    placeholder: "储物空间名称",
    text: sID,
    handler: function(text) {
      if (text==sID) {

      }
      else if (text=="") {
        $ui.alert("名字未做修改。")
      }
      else if (spaceExists(text)) {
        $ui.alert("这个储物空间已经存在了。")
      }
      else {
        allSpaces.map(function (space, idx) {
          if (space.sID==sID) {
            allSpaces[idx].sID=text
          }
        })
        $cache.set("spaces", allSpaces)
        $cache.set("storage_"+text, storage[sID])
        $cache.remove("storage_"+sID)
        
        prepareData()
        drawIt()
      }
    }
  })
}

function removeSpace(sID) {
  $ui.alert({
    title: "移除储物空间",
    message: "确定要移除？存放的物品也会一起删除！",
    actions: [
      {
        title: "确认",
        handler: function() {
          var m=0;
          for (var i=0; i<allSpaces.length; i++) {
            if (allSpaces[i].sID==sID) {
              m=i;
              break;
            }
          }
          allSpaces.splice(m, 1);
          $cache.set("spaces", allSpaces)
          $cache.remove("storage_"+sID)
          storage[sID].map(function(itemID, idx){
            allThings[itemID]=''
          })
          $cache.set("things", allThings)
          prepareData()
          drawIt()
        }
      },
      {
        title: "取消",
        handler: function() {
  
        }
      }
    ]
  })
}

function addItem(sID) {
  $input.text({
    type: $kbType.text,
    placeholder: "物品名称",
    handler: function(text) {
      itemID=allThings.length
      if (text=='') {
        $ui.alert("名称不能为空。")
      }
      else {
        allThings[itemID]=text
        $cache.set("things", allThings)
        if (storage[sID].length==1){
          storage[sID][0].push(itemID)
          $cache.set("storage_"+sID, storage[sID])
          var lastID=storage[sID][0].length
          $("list").insert({
            indexPath: $indexPath(0, lastID-1),
            value: text
          })
        }
        else {
          var layers=new Array()
          for (var i=0; i<storage[sID].length; i++){
           layers[i]="第"+(i+1)+"层"
          }
          $ui.menu({          
            items: layers,
            handler: function(title, idx) {
             storage[sID][idx].push(itemID)
             $cache.set("storage_"+sID, storage[sID])
             var lastID=storage[sID][idx].length
             $("list").insert({
              indexPath: $indexPath(idx, lastID-1),
              value: text
            })
           }
          })
         }
         
      }
    }
  })
}

function renameItem(sID, layer, row) {
  var itemID=storage[sID][layer][row]
  $input.text({
    type: $kbType.text,
    placeholder: "物品名称",
    text: allThings[itemID],
    handler: function(text) {
      if (text=='') {
        $ui.alert("名称不能为空。")
      }
      else {
        allThings[itemID]=text
        $cache.set("things", allThings)
        $("list").delete($indexPath (layer, row))
        $("list").insert({
          indexPath: $indexPath(layer, row),
          value: text
        })
      }
    }
  })
}

function moveItem(sID, layer, row) {
  var itemID=storage[sID][layer][row]
  var spaceNames=new Array()
  allSpaces.map(function(space) {
    spaceNames.push(space.sID)
  })
  
  $ui.menu({
    items: spaceNames,
    handler: function(title, idx) {
      spaceExists(title)
      if (storage[title].length==1){
        storage[title][0].push(itemID)
        $cache.set("storage_"+title, storage[title])
        storage[sID][layer].splice(row, 1)
        $cache.set("storage_"+sID, storage[sID])
        $("list").delete($indexPath (layer, row))
        if (sID==title) {
          var lastID=storage[title][0].length
          $("list").insert({
            indexPath: $indexPath(idx, lastID-1),
            value: allThings[itemID]
          })
        }
      }
      else {
        var layers=new Array()
        for (var i=0; i<storage[title].length; i++){
         layers[i]="第"+(i+1)+"层"
        }
        $ui.menu({          
          items: layers,
          handler: function(title2, idx) {
           storage[title][idx].push(itemID)
           $cache.set("storage_"+title, storage[title])
           storage[sID][layer].splice(row, 1)
           $cache.set("storage_"+sID, storage[sID])
           $("list").delete($indexPath (layer, row))
           if (sID==title) {
            var lastID=storage[title][idx].length
            $("list").insert({
              indexPath: $indexPath(idx, lastID-1),
                value: allThings[itemID]
            })
            }
          }
        })
      }
    }
  })
}

function removeItem(sID, layer, row) {
  var itemID=storage[sID][layer][row]
  $ui.alert({
    title: "移除物品",
    message: "确定要移除"+allThings[itemID]+"吗？",
    actions: [
      {
        title: "确认",
        handler: function() {
          allThings[itemID]=''
          $cache.set("things", allThings)
          storage[sID][layer].splice(row, 1)
          $cache.set("storage_"+sID, storage[sID])
          $("list").delete($indexPath (layer, row))
        }
      },
      {
        title: "取消",
        handler: function() {
  
        }
      }
    ]
  })
}

function searchItem() {
  var kw=$("input").text
  var neededID=new Array()
  if (kw!="") {
    allThings.map(function(itemName, itemID){
      if (itemName.indexOf(kw)!==-1) {
        neededID.push(itemID)
      }
    })
    
    if (neededID.length<1) {
      $ui.toast("找不到这个物品。")
    }
    else {
      //$console.info(neededID)
      var foundPlaces=new Array()
      for (var i=0; i<allSpaces.length; i++) {
        var sID=allSpaces[i].sID
        if (spaceExists(sID)) {
          for (var m=0; m<storage[sID].length; m++) {
            for (var k=0; k<storage[sID][m].length; k++) {
              if (neededID.indexOf(storage[sID][m][k])!=-1) {
                foundPlaces.push(allThings[storage[sID][m][k]]+"：在"+sID+"的第"+(m+1)+"层")
              }
            }
          }
        }
      }
      if (foundPlaces.length<1) {
        $ui.toast("找不到这个物品。")
      }
      else {
        $ui.push({
          props: {
            title: "寻找："+kw
          },
          views: [
          {
            type: "list",
            props: {
              data: foundPlaces,
              rowHeight: 60
            },
            layout: $layout.fill
          }]
          
        })
      }
    }
  }
  $("input").blur()
}


module.exports = {
  drawIt: drawIt
}