const ACCESS_TOKEN = 'f0oA8x+/lHnftiMp88+tKlu8Xv6tvY54qbLVoVMCxA6BOI045x1xYgyrV9RltpAB/DSEUYjloqu0KpeBlZionHRnt7Mji2aSI/pAH5OIMZ3B3XlhRhrlBY+U/NJKT3X4mrBS29JRT7y4Ar3WdMlxrQdB04t89/1O/w1cDnyilFU=';
const FOLDER_IMAGE_ID = '1OqtGI0cvl_YRBhaqhDZ1t5zXtFUFeBAd';
const FOLDER_VIDEO_ID = '1nqbZqI2MZ1LOKZk1FPVPN5QS-05bRpXF';
const FOLDER_DOC_ID   = '1ZtkH83DYVuKk515QhKawioR2cqvTNXHq';
const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';

function sendMsg(payload) {
  UrlFetchApp.fetch(REPLY_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload)
  });
}

function getFile(id,fName, type) {
  const url = `https://api-data.line.me/v2/bot/message/${id}/content`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`
    }
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let mime = 'application/octet-stream';
  let ext = '';

  var fileType = fName.split('.').pop(); // ดึงนามสกุลไฟล์

  if (type === 'image') {
    mime = 'image/png';
    ext = '.png';
  } else if (type === 'video') {
    mime = 'video/mp4';
    ext = '.mp4';
  }else if(type === 'file'){
    if(fileType == 'pdf'){
      mime = 'application/pdf';
      ext = '.pdf';
    }else if(fileType === 'zip'){
      mime = 'application/zip';
      ext = '.zip';
    }else if(fileType === 'rar'){
        mime = 'application/vnd.rar';
        ext = '.rar';
    } else if(fileType === '7z'){
        mime = 'application/x-7z-compressed';
        ext = '.7z';
    } else if(fileType === 'doc'){
        mime = 'application/msword';
        ext = '.doc';
    } else if(fileType === 'xls'){
        mime = 'application/vnd.ms-excel';
        ext = '.xls';
    } else if(fileType === 'ppt'){
        mime = 'application/vnd.ms-powerpoint';
        ext = '.ppt';
    } else if(fileType === 'docx'){
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        ext = '.docx';
    } else if(fileType === 'xlsx'){
        mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        ext = '.xlsx';
    } else if(fileType === 'pptx'){
        mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        ext = '.pptx';  
    } else if(fileType === 'txt'){
        mime = 'text/plain';
        ext = '.txt';   
        }  
  }



  const blob = response.getBlob().getAs(mime).setName(`${timestamp}${ext}`);
  return blob;
}

function saveFile(blob, folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    return file.getUrl();
  } catch (err) {
    Logger.log(err);
    return false;
  }
}

function doPost(e) {
  const json = JSON.parse(e.postData.contents);
  const event = json.events[0];

  if (event.type === 'message') {
    const msgType = event.message.type;
    var msgName = event.message.fileName;

    // const replyMsg = `✅ 0002type:\n` + msgType + '\nname:\n' + msgName;

    // sendMsg({
    //       replyToken: event.replyToken,
    //       messages: [{ type: 'text', text: replyMsg }]
    //     });

    if (['image', 'video', 'file'].includes(msgType)) {
      try {
        let folderId;
        if (msgType === 'image') folderId = FOLDER_IMAGE_ID;
        else if (msgType === 'video') folderId = FOLDER_VIDEO_ID;
        else folderId = FOLDER_DOC_ID;

        const blob = getFile(event.message.id,msgName, msgType);
        const fileUrl = saveFile(blob, folderId);

        const replyMsg = fileUrl
            ? `✅ บันทึกเรียบร้อยแล้ว0003:\n${fileUrl}`
            : '❌ เกิดข้อผิดพลาดในการบันทึกไฟล์';


        sendMsg({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: replyMsg }]
        });

      } catch (err) {
        Logger.log(err);
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}