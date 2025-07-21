document.addEventListener('DOMContentLoaded', function() {
    const convertButton = document.getElementById('convertButton');
    const inputTextArea = document.getElementById('sourceCodeA');
    const outputTextArea = document.getElementById('sourceCodeB');

    convertButton.addEventListener('click', function () {
        let input = inputTextArea.value;

        //<fc>, </fc> 문자열 모두 제거 (공백 포함)
        input = input.replace(/<\s*\/?\s*fc\s*>/gi, '').trim();

        // HeadColor=<%=...%> 제거
        input = input.replace(/HeadColor=<%=[^%>]+%>/g, '');

        // 줄별로 분리
        const lines = input.split('\n').map(line => line.trim()).filter(line => line);

        // setFields, setColumns 생성
        let fieldsArr = [];
        let columnsArr = [];

        lines.forEach(line => {
            // id 추출
            let idMatch = line.match(/id=([a-zA-Z0-9_]+)/);
            let idValue = idMatch ? idMatch[1] : '';

            // name 추출
            let nameMatch = line.match(/name="([^"]+)"/);
            let nameValue = nameMatch ? nameMatch[1] : '';

            // setFields용
            if (idValue) {
                fieldsArr.push(`    {fieldName: '${idValue}', dataType: 'text'}`);
            }

            // setColumns용
            let col = line;

            // HeadColor= (띄어쓰기 포함 값까지 제거)
            col = col.replace(/\bheadColor\s*=\s*<\s*%=[^%>]+%>\s*/gi, '');

            // ------------- Combo 주석 처리 로직 추가 -------------
            let isCombo = /editstyle\s*=\s*combo/gi.test(line) && /data\s*=/gi.test(line);

            // color={decode(colorFlag,"1","#747474", "black")} 삭제
            col = col.replace(/color\s*=\s*\{decode\([^\}]+\)\}/gi, '');

            // decao=0 삭제 
            col = col.replace(/decao\s*=\s*0/gi, '');

            // HeadColor=, Edit=, EditStyle=, data=, suppress= 태그 값 모두 제거 (대소문자 구분 없이, 띄어쓰기 단위)
            col = col.replace(/\b(headcolor|edit|editstyle|data|suppress|color|decode)\s*=\s*("[^"]*"|<%=[^%>]+%>|[^\s,}]*)/gi, '');

            // 1. show=true, show =true, show= true, show = true 모두 제거
            col = col.replace(/\bshow\s*=\s*true\b/gi, '');

            // id=명칭 → name: "명칭",   fieldName: "명칭"
            col = col.replace(/id=([a-zA-Z0-9_]+)/g, 'name: "$1",   fieldName: "$1",');

            // 2. header 만들기 (name="..."의 값을 message code=에 넣기)
            col = col.replace(/name="([^"]+)"/g, function(_, desc) {
                return `header: { template: '<span class: ""/> <lgcom:message code= "${desc}" />' },`; 
            });

            // lgcom:message code=: → lgcom:message code= (콜론 제거)
            col = col.replace(/lgcom:message code\s*:\s*/g, 'lgcom:message code=');

            // width=(숫자) → width: (숫자),
            col = col.replace(/width\s*=\s*(\d+)/g, 'width: $1,');

            // align 변환 (먼저 실행)
            col = col.replace(/align\s*=\s*left/gi, 'styleName: "textAlignment-near",');
            col = col.replace(/align\s*=\s*right/gi, 'styleName: "textAlignment-far",');
            col = col.replace(/align\s*=\s*center/gi, 'styleName: "textAlignment-center",');

            // 3. Edit=none 처리: styleName에 grid-input-bg-disable 추가 (align 변환 후에 실행)
            let editNone = /edit\s*=\s*none/gi.test(line);
            if (editNone) {
                // styleName이 이미 있으면 뒤에 추가, 없으면 새로 추가
                if (/styleName\s*:\s*"/.test(col)) {
                    col = col.replace(/styleName\s*:\s*"([^"]*)"/, function(_, styleVal) {
                        // 중복 방지
                        if (styleVal.includes('grid-input-bg-disable')) return `styleName: "${styleVal}"`;
                        return `styleName: "${styleVal} grid-input-bg-disable"`;
                    });
                } else {
                    // align이 없을 수도 있으니, 마지막에 추가
                    col += ', styleName: "grid-input-bg-disable"';
                }
            }

            // editable: 태그는 editable= 로 바꿔주기
            //col = col.replace(/editable\s*:/gi, 'editable=');

            // header 내 text: "..." 항목만 제거 (쉼표도 같이)
            col = col.replace(/(header\s*:\s*{)[^}]*text:\s*"[^"]*",?/gi, '$1');

            // 남은 =만 :로 변환, :: 방지
            col = col.replace(/([^:])=([^=])/g, '$1: $2');

            // 쉼표(,) 단위로 줄바꿈 및 탭 처리, header 태그는 무조건 1줄로 표기
            col = col.replace(/header\s*:\s*{[^}]*}/g, function(headerBlock) {
                return headerBlock.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\s*,\s*}/, ' },');
            });
            col = col.split(',').map(s => s.trim()).filter(Boolean).map(s => {
                if (s.startsWith('header: {')) return '    ' + s;
                return '    ' + s;
            }).join(',\n');

            // Combo 주석 추가
            if (isCombo) {
                col += '\n    /* Combo  */';
            }

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