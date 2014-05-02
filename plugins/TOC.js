
// Copyright (c) 2014, Daiki Umeda (XJINE) - lightweightmarkuplanguage.com
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
// 
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
// 
// * Neither the name of the copyright holder nor the names of its
//   contributors may be used to endorse or promote products derived from
//   this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

KARAS.toc = new Object();

KARAS.toc.action = function(text, options)
{
    //match group index.
    var mgiAllText = 0;
    var mgiMarks = 1;
    var mgiMarkedupText = 2;
    var mgiBreaks = 3;

    var topLevel = 1;
    var bottomLevel = 6;

    if (options.length > 0)
    {
        topLevel = parseInt(options[0], 10);
    }

    if (options.length > 1)
    {
        bottomLevel = parseInt(options[1], 10);
    }

    var newText = "";
    var previousLevel = 0;

    var match;
    var nextMatchIndex = 0;
    KARAS.RegexHeading.lastIndex = 0;

    while (true)
    {
        match = KARAS.RegexHeading.exec(text);

        if (match === null)
        {
            for (var i = 0; i < previousLevel; i += 1)
            {
                newText += "</li>\n</ul>\n";
            }

            break;
        }

        if (match[mgiMarks].length <= bottomLevel)
        {

            var level = match[mgiMarks].length;
            level = level - topLevel + 1;

            if (level > 0)
            {
                var levelDiff = level - previousLevel;
                previousLevel = level;

                if (levelDiff > 0)
                {
                    for (var i = 0; i < levelDiff; i += 1)
                    {
                        newText += "\n<ul>\n<li>";
                    }
                }
                else if (levelDiff < 0)
                {
                    for (var i = 0; i > levelDiff; i -= 1)
                    {
                        newText += "</li>\n</ul>\n";
                    }

                    newText += "<li>";
                }
                else
                {
                    newText += "</li>\n<li>";
                }

                var markedupText = KARAS.convertInlineMarkup(match[mgiMarkedupText]);
                var markedupTexts = KARAS.splitOptions(markedupText);
                var itemText = markedupTexts[0];

                if (markedupTexts.length > 1)
                {
                    itemText = "<a href=\"#" + markedupTexts[1].trim() + "\">" + itemText + "</a>";
                }

                newText += itemText;
            }
        }

        nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText)
                         + match[mgiAllText].length
                         - match[mgiBreaks].length;
        KARAS.RegexHeading.lastIndex = nextMatchIndex;
    }

    return newText.trim();
};