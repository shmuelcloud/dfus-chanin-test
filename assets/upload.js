/* ===== Secure file upload (Cloudinary) + EmailJS notifications ===== */
(function(){
  if(!document.getElementById('dropZone')) return;

  var CLD_CLOUD  = 'k7gqgzaq';
  var CLD_PRESET = 'Hanin-Print';
  var ALLOWED_EXT = ['pdf','jpg','jpeg','png','tiff','tif','ai','eps','docx'];
  var MAX_SIZE = 52428800; // 50MB
  var MAGIC = {
    pdf:   [0x25,0x50,0x44,0x46],
    jpg:   [0xFF,0xD8,0xFF],
    png:   [0x89,0x50,0x4E,0x47],
    tiff1: [0x49,0x49,0x2A,0x00],
    tiff2: [0x4D,0x4D,0x00,0x2A],
    docx:  [0x50,0x4B,0x03,0x04],
    ps:    [0x25,0x21]
  };
  var EXT_ICONS = {pdf:'📕',jpg:'🖼️',jpeg:'🖼️',png:'🖼️',tiff:'🖼️',tif:'🖼️',ai:'🎨',eps:'🎨',docx:'📝'};

  var selectedFile = null;
  var selectedService = '';

  // Service-type dropdown
  window.toggleSvc = function(e){
    if(e) e.stopPropagation();
    document.getElementById('svcSelect').classList.toggle('open');
    document.getElementById('svcMenu').classList.toggle('open');
  };
  window.pickSvc = function(name){
    selectedService = name;
    document.getElementById('svcLabel').textContent = name;
    document.getElementById('svcSelect').classList.remove('open');
    document.getElementById('svcMenu').classList.remove('open');
  };
  document.addEventListener('click', function(e){
    var sel = document.getElementById('svcSelect'), menu = document.getElementById('svcMenu');
    if(sel && menu && !sel.contains(e.target) && !menu.contains(e.target)){
      sel.classList.remove('open'); menu.classList.remove('open');
    }
  });

  function matchBytes(arr, sig){ for(var i=0;i<sig.length;i++) if(arr[i]!==sig[i]) return false; return true; }
  function fmtSize(b){ return b>1048576 ? (b/1048576).toFixed(1)+' MB' : Math.round(b/1024)+' KB'; }
  function setStatus(type,msg){ var el=document.getElementById('uploadStatus'); el.textContent=msg; el.className='upload-status show '+type; }
  function setProgress(pct){
    var prog=document.getElementById('uploadProgress'), bar=document.getElementById('progressBar');
    if(pct===null){ prog.className='upload-progress'; return; }
    prog.className='upload-progress show'; bar.style.width=pct+'%';
  }

  function showFilePreview(file){
    var ext=file.name.split('.').pop().toLowerCase();
    document.getElementById('fileIcon').textContent=EXT_ICONS[ext]||'📄';
    document.getElementById('fileName').textContent=file.name;
    document.getElementById('fileSize').textContent=fmtSize(file.size);
    document.getElementById('filePreview').className='file-preview show';
    document.getElementById('dropZone').style.display='none';
    document.getElementById('uploadStatus').className='upload-status';
    setProgress(null);
  }

  function clearFile(){
    selectedFile=null;
    document.getElementById('fileInput').value='';
    document.getElementById('filePreview').className='file-preview';
    document.getElementById('dropZone').style.display='';
    document.getElementById('uploadStatus').className='upload-status';
    setProgress(null);
  }

  function validateAndSet(file){
    var ext=file.name.split('.').pop().toLowerCase();
    if(ALLOWED_EXT.indexOf(ext)===-1) return setStatus('error','סוג קובץ לא מורשה. מותרים: PDF, JPG, PNG, TIFF, AI, EPS, DOCX');
    if(file.size>MAX_SIZE) return setStatus('error','הקובץ גדול מדי — המקסימום הוא 50MB');
    var reader=new FileReader();
    reader.onload=function(e){
      var a=new Uint8Array(e.target.result);
      var ok=matchBytes(a,MAGIC.pdf)||matchBytes(a,MAGIC.jpg)||matchBytes(a,MAGIC.png)||
             matchBytes(a,MAGIC.tiff1)||matchBytes(a,MAGIC.tiff2)||matchBytes(a,MAGIC.docx)||matchBytes(a,MAGIC.ps);
      if(!ok) return setStatus('error','תוכן הקובץ אינו תואם לסוג שצוין — אנא ודאו שהקובץ תקין');
      selectedFile=file; showFilePreview(file);
    };
    reader.readAsArrayBuffer(file.slice(0,8));
  }

  document.getElementById('fileInput').addEventListener('change', function(e){
    if(e.target.files[0]) validateAndSet(e.target.files[0]);
  });
  document.getElementById('fileRemove').addEventListener('click', function(e){
    e.stopPropagation(); clearFile();
  });

  var dz=document.getElementById('dropZone');
  dz.addEventListener('dragover', function(e){ e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', function(){ dz.classList.remove('drag-over'); });
  dz.addEventListener('drop', function(e){
    e.preventDefault(); dz.classList.remove('drag-over');
    if(e.dataTransfer.files[0]) validateAndSet(e.dataTransfer.files[0]);
  });

  window.submitUpload = function(){
    var name=document.getElementById('u-name').value.trim();
    var phone=document.getElementById('u-phone').value.trim();
    var email=document.getElementById('u-email').value.trim();
    if(!name||!phone||!email) return setStatus('error','אנא מלאו שם, טלפון ואימייל לפני שליחה');
    if(!document.getElementById('u-terms').checked) return setStatus('error','אנא אשרו את תנאי השימוש לפני שליחה');
    if(!selectedFile) return setStatus('error','אנא בחרו קובץ להעלאה');

    var btn=document.getElementById('uploadBtn');
    btn.disabled=true;
    setStatus('loading','⏳ מעלה קובץ... אנא המתינו');
    setProgress(10);

    var fd=new FormData();
    fd.append('file',selectedFile);
    fd.append('upload_preset',CLD_PRESET);

    var xhr=new XMLHttpRequest();
    xhr.open('POST','https://api.cloudinary.com/v1_1/'+CLD_CLOUD+'/auto/upload');
    xhr.upload.onprogress=function(e){ if(e.lengthComputable) setProgress(Math.round(e.loaded/e.total*90)); };
    xhr.onload=function(){
      btn.disabled=false;
      if(xhr.status===200){
        var res=JSON.parse(xhr.responseText);
        var fileUrl=res.secure_url;
        setProgress(100);
        var rawNotes=document.getElementById('u-notes').value.trim();
        var notesVal=(selectedService ? 'סוג שירות: '+selectedService : '') +
                     (selectedService && rawNotes ? ' | ' : '') +
                     rawNotes;
        if(!notesVal) notesVal='—';

        emailjs.send('service_84430n4','template_awswyz8',{
          to_email:'hanin@hanin.co.il', customer_name:name, customer_phone:phone,
          customer_email:email, service_type:selectedService||'—', notes:notesVal, file_url:fileUrl
        });
        emailjs.send('service_84430n4','template_y0syexe',{
          customer_email:email, customer_name:name, customer_phone:phone,
          service_type:selectedService||'—', notes:notesVal
        });

        setStatus('success','✓ הקובץ הועלה בהצלחה! נחזור אל '+name+' בהקדם לאישור ותיאום.');
        setTimeout(function(){ setProgress(null); }, 1500);
      } else {
        setProgress(null);
        setStatus('error','שגיאה בהעלאה — אנא נסו שוב או צרו קשר בטלפון');
      }
    };
    xhr.onerror=function(){ btn.disabled=false; setProgress(null); setStatus('error','שגיאת רשת — אנא בדקו את החיבור ונסו שוב'); };
    xhr.send(fd);
  };
})();
