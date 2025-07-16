document.addEventListener('DOMContentLoaded', function() {
    const sqlConvertButton = document.getElementById('sqlConvertButton');
    const sqlSourceA = document.getElementById('sqlSourceA');
    const sqlSourceB = document.getElementById('sqlSourceB');

    if (!sqlConvertButton) return;

    sqlConvertButton.addEventListener('click', function () {
        let input = sqlSourceA.value;

        // 1. <statement name='select~List'> → <select id="select~List" parameterType="java.util.HashMap" resultType="LowerCamelCaseMap">
        input = input.replace(
            /<statement\s+name=['"]([^'"]+)['"]\s*>/gi,
            '<select id="$1" parameterType="java.util.HashMap" resultType="LowerCamelCaseMap">'
        );

        // 2. <append condition="${factoryName}.NOTEMPTY" id="#1"> ... </append> 변환
        let appendBlocks = {};
        input = input.replace(
            /<append\s+condition="\$\{([^}]+)\}\.NOTEMPTY"\s+id="(#\d+)">\s*([\s\S]*?)<\/append>/gi,
            function(match, varName, hashId, inner) {
                appendBlocks[hashId] = [
                    `      <!-- ${hashId}-->`,
                    `      <if test="${varName} != null and ${varName} != ''">`,
                    `           AND    factory_code IN             `,
                    `           <foreach collection="${varName}" index="idx" open="(" close=")" separator=", ">`,
                    `                 #{${varName}[\${idx}].${varName}}`,
                    `            </foreach>`,
                    `      </if>`
                ].join('\n');
                return '';
            }
        );

        // 3. <![CDATA[ ... ]]> 내부에서 {#1} 을 append 변환 결과로 치환, ORDER BY는 CDATA 끝으로 이동
        input = input.replace(/<!\[CDATA\[((?:.|\n)*?)\]\]>/g, function(match, cdataContent) {
            // {#1} 치환
            let replaced = cdataContent.replace(/\{#(\d+)\}/g, function(m, num) {
                let key = `#${num}`;
                return appendBlocks[key] ? '\n' + appendBlocks[key] + '\n' : m;
            });

            // ORDER BY ... 구문을 CDATA 내에서 맨 마지막(]]> 직전)으로 이동
            let orderByMatch = replaced.match(/^\s*ORDER\s+BY[\s\S]*?(?=\n|$)/gim);
            if (orderByMatch) {
                replaced = replaced.replace(/^\s*ORDER\s+BY[\s\S]*?(?=\n|$)/gim, '');
                replaced = replaced.replace(/\s*$/, '\n' + orderByMatch.join('\n').trim());
            }

            // 항상 CDATA 닫기 전에 줄바꿈 추가
            return '<![CDATA[' + replaced + '\n]]>';
        });

        // 4. </statement>를 </select>로 변경
        input = input.replace(/<\/statement>/gi, '</select>');

        sqlSourceB.value = input;
    });
});