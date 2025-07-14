document.addEventListener('DOMContentLoaded', function() {
    const convertButton = document.getElementById('convertButton');
    const inputTextArea = document.getElementById('sourceCodeA');
    const outputTextArea = document.getElementById('sourceCodeB');

    convertButton.addEventListener('click', function () {
        let input = inputTextArea.value;

                // 1. <fc>, </fc> 문자열 모두 제거 (공백 포함)
        input = input.replace(/<\s*\/?\s*fc\s*>/gi, '').trim();

        // HeadColor=<%=...%> 제거
        input = input.replace(/HeadColor=<%=[^%>]+%>/g, '');

        // Edit=None → Edit: false
        input = input.replace(/Edit=None/g, 'Edit: false');

        // 줄별로 분리
        const lines = input.split('\n').map(line => line.trim()).filter(line => line);

        // setFields, setColumns 생성
        let fieldsArr = [];
        let columnsArr = [];

        lines.forEach(line => {
            // id 추출
            let idMatch = line.match(/id=([a-zA-Z0-9_]+)/);
            let idValue = idMatch ? idMatch[1] : '';

            // setFields용
            if (idValue) {
                fieldsArr.push(`    {fieldName: '${idValue}', dataType: 'text'}`);
            }

            // setColumns용
            let col = line;

             // HeadColor= (띄어쓰기 포함 값까지 제거)
            col = col.replace(/\bheadColor\s*=\s*<\s*%=[^%>]+%>\s*/gi, '');
        
            // HeadColor=, Edit=, EditStyle=, data= 태그 값 모두 제거 (대소문자 구분 없이, 띄어쓰기 단위)
            col = col.replace(/\b(headcolor|edit|editstyle|data|suppress)\s*=\s*("[^"]*"|<%=[^%>]+%>|[^\s,}]*)/gi, '');


            // id=명칭 → name: "명칭",   fieldName: "명칭"
            col = col.replace(/id=([a-zA-Z0-9_]+)/g, 'name: "$1",   fieldName: "$1",');

            // name="Test Desc." → header: { text:"* Test Desc.", template: '<span class="" ></span> <lgcom:message code="testDe" />',},
            col = col.replace(/name="([^"]+)"/g, function(_, desc) {
                return `header: { text:"${desc}", template: '<span class="" ></span> <lgcom:message code=="${idValue}" />',},`;
            });

            // lgcom:message code=: 
            col = col.replace(/lgcom:message code=:\s*/g, 'lgcom:message code='); 

            // width=(숫자) → width: (숫자),
            col = col.replace(/width=(\d+)/g, 'width: $1,');

            // show=true → show: true
            col = col.replace(/show=true/g, 'show: true');

            // align 변환
            col = col.replace(/align=left/g, 'styleName: "textAlignment-near",');
            col = col.replace(/align=right/g, 'styleName: "textAlignment-far",');
            col = col.replace(/align=center/g, 'styleName: "textAlignment-center",');

            // header 내 text: "..." 항목만 제거 (쉼표도 같이)
            col = col.replace(/(header\s*:\s*{)\s*text:\s*"[^"]*",?/gi, '$1');

            // 남은 =만 :로 변환, :: 방지
            col = col.replace(/([^:])=([^=])/g, '$1: $2');

            // 1. 쉼표(,) 단위로 줄바꿈 및 탭 처리, header 태그는 무조건 1줄로 표기
            // header: { ... } 를 한 줄로 만들고, 나머지는 줄바꿈
            col = col.replace(/header\s*:\s*{[^}]*}/g, function(headerBlock) {
                // 중간 줄바꿈/공백 제거 후 한 줄로
                return headerBlock.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\s*,\s*}/, ' },');
            });
            // 쉼표 기준 줄바꿈 및 탭 처리
            col = col.split(',').map(s => s.trim()).filter(Boolean).map(s => {
                // header: { ... }는 이미 한 줄이므로 그대로, 아니면 들여쓰기
                if (s.startsWith('header: {')) return '    ' + s;
                return '    ' + s;
            }).join(',\n');

            // 보기 좋게 중괄호로 감싸기
            col = `{\n${col}\n}`;

            columnsArr.push(col);
        });

        // setFields, setColumns 문자열 조립
        let fieldsStr = '/* setFields 생성 */\nvar setFields = [\n' + fieldsArr.join(',\n') + '\n]\n';
        let columnsStr = '/* setColumns 생성 */\nvar setColumns = [\n' + columnsArr.join(',\n') + '\n]';

        outputTextArea.value = fieldsStr + '\n\n' + columnsStr;

    });
});