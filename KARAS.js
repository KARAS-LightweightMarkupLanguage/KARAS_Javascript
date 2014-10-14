
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

//Need Javascript version 1.8.5 or later.

var KARAS = new Object();

(function()
{
    //Block group
    KARAS.RegexBlockGroup
        = new RegExp("^(?:(\\{\\{)(.*?)|\\}\\}.*?)$", "gm");
    KARAS.RegexFigcaptionSummary 
        = new RegExp("(?:^|\n)(\\=+)([\\s\\S]*?)(\\n(?:(?:(?:\\||\\!)"
                     + "[\\|\\=\\>\\<]|\\=|\\-|\\+|\\;|\\>|\\<)|\n)|$)", "g");

    //Block markup
    KARAS.RegexBlockquote
       = new RegExp("(?:^|\n)(\\>+)([\\s\\S]*?)(?:(\n\\>)"
                    + "|(\n(?:\n|\\=|\\-|\\+|\\;|(?:(?:\\||\\!)[\\|\\=\\>\\<])))|$)", "g");
    KARAS.RegexTableBlock
       = new RegExp("(?:^|\n)((?:\\||\\!)(?:\\||\\>|\\<|\\=)[\\s\\S]*?)"
                    + "(\n(?!(?:\\||\\!)[\\|\\=\\>\\<])|$)", "g");
    KARAS.RegexTableCell
       = new RegExp("(\\\\*)(\\||\\!)(\\||\\>|\\<|\\=)", "gm");
    KARAS.RegexList
       = new RegExp("(?:^|\n)((?:\\-|\\+)+)([\\s\\S]*?)(?:(\n(?:\\-|\\+))|(\n(?:\n|\\;|\\=))|$)", "g");
    KARAS.RegexDefList
       = new RegExp("(?:^|\n)(\\;+)([\\s\\S]*?)(?:(\n\\;)|(\n(?:\n|\\=))|$)", "g");
    KARAS.RegexHeading
       = new RegExp("(?:^|\n)(\\=+)([\\s\\S]*?)(\n\\=|\n{2,}|$)", "g");
    //It is important to check '\n{2,}' first, to exclude \n chars.
    KARAS.RegexBlockLink
       = new RegExp("(?:\n{2,}|^\n*)\\s*\\({2,}[\\s\\S]+?(?:\n{2,}|$)", "g");
    KARAS.RegexParagraph
       = new RegExp("(?:\n{2,}|^\n*)(\\s*(\\<*)[\\s\\S]+?)(?:\n{2,}|$)", "g");

    //Inline markup
    KARAS.RegexInlineMarkup
        = new RegExp("(\\\\*)(\\*{2,}|\\/{2,}|\\_{2,}|\\%{2,}|\\@{2,}"
                    + "|\\?{2,}|\\${2,}|\\`{2,}|\\'{2,}|\\,{2,}|\"{2,}"
                    + "|\\({2,}[\t\v\f\u0020\u00A0]*\\(*|\\){2,}[\t\v\f\u0020\u00A0]*\\)*"
                    + "|\\<{2,}[\u0020\u00A0]*\\<*|\\>{2,}[\u0020\u00A0]*\\>*)", "g");
    KARAS.RegexLineBreak
       = new RegExp("(\\\\*)(\\~(?:\n|$))", "g");

    //Other syntax
    KARAS.RegexPlugin
       = new RegExp("(\\\\*)((\\[{2,}[\u0020\u00A0]*\\[*)|(\\]{2,}[\u0020\u00A0]*\\]*))", "g");
    KARAS.RegexCommentOut
       = new RegExp("(\\\\*)(\\#{2,})", "g");
    KARAS.RegexSplitOption
       = new RegExp("(\\\\*)(\\:{2,3})", "g");

    //Other
    KARAS.RegexEscape
        = new RegExp("\\\\+", "g");
    KARAS.RegexProtocol
        = new RegExp(":{1,1}(/{2,})", "g");
    KARAS.RegexWhiteSpace
        = new RegExp("\\s", "g");
    KARAS.RegexWhiteSpaceLine
        = new RegExp("^[\t\v\f\u0020\u00A0]+$", "gm");
    KARAS.RegexLineBreakCode
        = new RegExp("\r\n|\r|\n");
    KARAS.RegexBlankLine
        = new RegExp("^\n", "gm");
    KARAS.RegexPreElement
        = new RegExp("(<pre\\s*.*?>)|<\\/pre>", "gim");
    KARAS.RegexLinkElement
        = new RegExp("(?:<a.*?>.*?<\\/a>)|(?:<img.*?>)|(?:<video.*?>.*?<\\/video>)"
                     + "|(?:<audio.*?>.*?<\\/audio>)|<object.*?>.*?<\\/object>", "gi");
    KARAS.RegexStringTypeAttribute
        = new RegExp("([^\\s]+?)\\s*=\\s*\"(.+?)\"", "g");
    KARAS.RegexFileExtension
        = new RegExp(".+\\.(.+?)$");

    KARAS.BlockGroupTypeUndefined = -1;
    KARAS.BlockGroupTypeDiv = 0;
    KARAS.BlockGroupTypeDetails = 8;
    KARAS.BlockGroupTypeFigure = 9;
    KARAS.BlockGroupTypePre = 10;
    KARAS.BlockGroupTypeCode = 11;
    KARAS.BlockGroupTypeKbd = 12;
    KARAS.BlockGroupTypeSamp = 13;

    KARAS.ReservedBlockGroupTypes = new Array
    (
        "div", "header", "footer", "nav",
        "article", "section", "aside", "address",
        "details", "figure",
        "pre", "code", "kbd", "samp"
    );

    KARAS.InlineMarkupTypeDefAbbr = 5;
    KARAS.InlineMarkupVarCode = 6;
    KARAS.InlineMarkupKbdSamp = 7;
    KARAS.InlineMarkupTypeSupRuby = 8;
    KARAS.InlineMarkupTypeLinkOpen = 11;
    KARAS.InlineMarkupTypeLinkClose = 12;
    KARAS.InlineMarkupTypeInlineGroupOpen = 13;
    KARAS.InlineMarkupTypeInlineGroupClose = 14;

    KARAS.InlineMarkupSets = new Array
    (
        [ "*", "b", "strong"],
        [ "/", "i", "em"],
        [ "_", "u", "ins"],
        [ "%", "s", "del"],
        [ "@", "cite", "small"],
        [ "?", "dfn", "abbr"],
        [ "$", "kbd", "samp"],
        [ "`", "var", "code"],
        [ "'", "sup", "ruby"],
        [ ",", "sub"],
        [ "\"", "q"],
        [ "(", "a"],
        [ ")", "a"],
        [ "<", "span"],
        [ ">", "span"]
    );

    KARAS.MediaTypeImage = 0;
    KARAS.MediaTypeAudio = 1;
    KARAS.MediaTypeVideo = 2;
    KARAS.MediaTypeUnknown = 3;

    KARAS.MediaExtensions = new Array
    (
        /bmp|bitmap|gif|jpg|jpeg|png/i,
        /aac|aiff|flac|mp3|ogg|wav|wave/i,
        /asf|avi|flv|mov|movie|mpg|mpeg|mp4|ogv|webm/i
    );

    KARAS.ReservedObjectAttributes = new Array
    (
        "width", "height", "type", "typemustmatch", "name", "usemap", "form"
    );

    KARAS.ListTypeUl = true;
    KARAS.ListTypeOl = false;

    //KARAS.PluginDirectory  = "plugins";
    KARAS.DefaultEscapeCode = "escpcode";





    KARAS.convert = function(text, startLevelOfHeading)
    {
        var escapeCode = KARAS.generateSafeEscapeCode(text, KARAS.DefaultEscapeCode);
        var escapeCodeRegex = new RegExp(escapeCode, "g");
        var lineBreakCode = KARAS.getDefaultLineBreakCode(text);
        text = text.replace(/\r\n/g, "\n");
        text = text.replace(/\r/g, "\n");

        text = KARAS.replaceTextInPluginSyntax(text, ">", escapeCode + ">");
        text = KARAS.replaceTextInPluginSyntax(text, "{", escapeCode + "{");
        text = KARAS.replaceTextInPreElement(text, "\n", escapeCode + "\n" + escapeCode);
        var hasUnConvertedBlockquote = true;
        while (hasUnConvertedBlockquote)
        {
           text = KARAS.convertBlockGroup(text, escapeCode);
           var result = KARAS.convertBlockquote(text, hasUnConvertedBlockquote, escapeCode);
           text = result.text;
           hasUnConvertedBlockquote = result.hasUnConvertedBlockquote;
        }

        text = text.replace(escapeCodeRegex, "");
        text = KARAS.replaceTextInPreElement(text, "\\[", escapeCode + "[");
        text = KARAS.convertPlugin(text);

        text = KARAS.replaceTextInPreElement(text, "\n", escapeCode + "\n" + escapeCode);
        hasUnConvertedBlockquote = true;
        while (hasUnConvertedBlockquote)
        {
           text = KARAS.convertBlockGroup(text, escapeCode);
           var result = KARAS.convertBlockquote(text, hasUnConvertedBlockquote, escapeCode);
           text = result.text;
           hasUnConvertedBlockquote = result.hasUnConvertedBlockquote;
        }

        text = KARAS.replaceTextInPreElement(text, "#", escapeCode + "#");
        text = KARAS.convertCommentOut(text);
        text = KARAS.convertWhiteSpaceLine(text);
        text = KARAS.convertProtocol(text);
        text = KARAS.convertTable(text);
        text = KARAS.convertList(text);
        text = KARAS.convertDefList(text);
        text = KARAS.convertHeading(text, startLevelOfHeading);
        text = KARAS.convertBlockLink(text);
        text = KARAS.convertParagraph(text);
        text = KARAS.reduceBlankLine(text);

        text = text.replace(escapeCodeRegex, "");
        text = KARAS.replaceTextInPreElement(text, "\\\\", escapeCode);
        text = KARAS.reduceEscape(text);
        text = KARAS.replaceTextInPreElement(text, escapeCode, "\\");
        text = text.replace(/\n/g, lineBreakCode);

        return text;
    };

    KARAS.getDefaultLineBreakCode = function(text)
    {
        var match = KARAS.RegexLineBreakCode.exec(text);

        if (match != null)
        {
            return match[0];
        }
        else
        {
            return "\n";
        }
    };

    KARAS.generateSafeEscapeCode = function(text, escapeCode)
    {
        var seed = "0123456789abcdefghijklmnopqrstuvwxyz";           

        while (true)
        {
            if (text.indexOf(escapeCode) == -1)
            {
                break;
            }

            escapeCode = "";

            for (var i = 0; i < 8; i++)
            {
                escapeCode += seed.charAt(Math.floor(Math.random() * 36));
            }
        }

        return escapeCode;
    };

    //javascript ver. only.
    KARAS.indexOfMatchGroup = function(match, groupIndex)
    {
        var index = match.index;
        for (var i = 1; i < groupIndex; i++)
        {
            index += match[i].length;
        }

        return index;
    };

    function PluginMatch()
    {
       this.index = -1;
       this.marks = "";
    }

    KARAS.replaceTextInPluginSyntax = function(text, oldText, newText)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiMarks = 2;
        var mgiOpenMarks = 3;
        //number mgiCloseMarks = 4;

        var matchStack = new Array();
        var match = null;
        var nextMatchIndex = 0;
        var oldTextRegex = new RegExp(oldText, "g");

        while(true) {
            match = KARAS.RegexPlugin.exec(text);

            if(match == null)
                break;

            if(match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks) + 1;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            if(match[mgiOpenMarks] != null)
            {
                var pluginMatch = new PluginMatch();
                pluginMatch.index = KARAS.indexOfMatchGroup(match, mgiMarks);
                matchStack.unshift(pluginMatch);
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            if(matchStack.length == 0)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            var preMatch = matchStack.shift();
            var markedupText = text.substr
                (preMatch.index, KARAS.indexOfMatchGroup(match, mgiMarks) - preMatch.index);
            markedupText = markedupText.replace(oldTextRegex, newText);

            text = KARAS.removeAndInsertText(text,
                                       preMatch.index,
                                       KARAS.indexOfMatchGroup(match, mgiMarks) - preMatch.index,
                                       markedupText);
            nextMatchIndex = preMatch.index + markedupText.length;
            KARAS.RegexPlugin.lastIndex = nextMatchIndex;
        }

        return text;
    };

    KARAS.replaceTextInPreElement = function(text, oldText, newText)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiOpenPreElement = 1;

        var matchStack = new Array();
        var match = null;
        var nextMatchIndex = 0;
        var oldTextRegex = new RegExp(oldText, "g");

        while (true)
        {
            match = KARAS.RegexPreElement.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiOpenPreElement] != null)
            {
                var index = KARAS.indexOfMatchGroup(match, mgiOpenPreElement)
                            + match[mgiOpenPreElement].length;

                matchStack.unshift(index);
                nextMatchIndex = index;
                KARAS.RegexPreElement.lastIndex = nextMatchIndex;
                continue;
            }

            if (matchStack.length == 0)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexPreElement.lastIndex = nextMatchIndex;
                continue;
            }

            var preTextStart = matchStack.shift();
            var preTextEnd = KARAS.indexOfMatchGroup(match, mgiAllText);
            var preText = text.substr(preTextStart, preTextEnd - preTextStart);
            preText = preText.replace(oldTextRegex, newText);
            text = KARAS.removeAndInsertText
                (text, preTextStart, preTextEnd - preTextStart, preText);
            nextMatchIndex = preTextStart + newText.length + match[mgiAllText].length;
            KARAS.RegexPreElement.lastIndex = nextMatchIndex;
        }

        return text;
    };





    KARAS.encloseWithLinebreak = function(text)
    {
        return "\n" + text + "\n";
    };

    KARAS.escapeHTMLSpecialCharacters = function(text)
    {
        text = text.replace(/&/g, "&amp;");
        text = text.replace(/\"/g, "&#34;");
        text = text.replace(/\'/g, "&#39;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        return text;
    };

    KARAS.removeAndInsertText = function(text, index, removeLength, newText)
    {
        return text.substr(0, index) + newText + text.substr(index + removeLength);
    };

    KARAS.removeWhiteSpace = function(text)
    {
        return text.replace(KARAS.RegexWhiteSpace, "");
    };

    KARAS.splitOption = function(text, isSpecialOption)
    {        
        //match group index.
        //number mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiMarks = 2;

        var result = new Object();
        result.isSpecialOption = isSpecialOption;
        result.options = new Array();
        var match = null;
        var nextMatchIndex = 0;

        KARAS.RegexSplitOption.lastIndex = 0;

        while (true)
        {
            match = KARAS.RegexSplitOption.exec(text);

            if (match == null)
            {
                result.options.push(text.trim());
                return result;
            }

            if (match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks) + 1;
                KARAS.RegexSplitOption.lastIndex = nextMatchIndex;
                continue;
            }

            if(match[mgiMarks].length == 3)
            {
                result.isSpecialOption = true;
            }
            else
            {
                result.isSpecialOption = false;
            }

            result.options.push(text.substr(0, KARAS.indexOfMatchGroup(match, mgiMarks)).trim());
            result.options.push(text.substr(KARAS.indexOfMatchGroup(match, mgiMarks)
                                + match[mgiMarks].length).trim());

            return result;
        }
    };

    KARAS.splitOptions = function(text, hasSpecialOption)
    {
        var result = new Object();
        result.hasSpecialOption = hasSpecialOption;
        result.options = new Array();
        var restText = text.trim();

        while (true)
        {
            var splitResult = KARAS.splitOption(restText, false); 

            if (splitResult.options.length == 1)
            {
                result.options.push(restText);
                break;
            }

            if(splitResult.isSpecialOption == true)
            {
                result.options.push(splitResult.options[0]);
                result.options.push(splitResult.options[1]);
                result.hasSpecialOption = true;
                break;
            }

            result.options.push(splitResult.options[0]);
            restText = splitResult.options[1];
        }

        return result;
    };





    KARAS.convertPlugin = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiMarks = 2;
        var mgiOpenMarks = 3;
        var mgiCloseMarks = 4;

        var matchStack = new Array();
        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexPlugin.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks) + 1;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            if (match[mgiOpenMarks] != null)
            {
                var pluginMatch = new PluginMatch();
                pluginMatch.index = KARAS.indexOfMatchGroup(match, mgiMarks);
                pluginMatch.marks = match[mgiMarks];
                matchStack.unshift(pluginMatch);
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            if (matchStack.length == 0)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexPlugin.lastIndex = nextMatchIndex;
                continue;
            }

            var preMatch = matchStack.shift();
            var markedupTextIndex = preMatch.index + preMatch.marks.length;
            var markedupText = text.substr
                (markedupTextIndex, KARAS.indexOfMatchGroup(match, mgiAllText) - markedupTextIndex);
            var openMarks = KARAS.removeWhiteSpace(preMatch.marks);
            var closeMarks = KARAS.removeWhiteSpace(match[mgiCloseMarks]);
            var newText = KARAS.constructPluginText
                (text, markedupText, openMarks, closeMarks);
            var markDiff = openMarks.length - closeMarks.length;

            if (markDiff > 0)
            {
                openMarks = openMarks.substr(0, markDiff);
                closeMarks = "";

                if (markDiff > 1)
                {
                    preMatch.marks = openMarks.substr(0, markDiff);
                    matchStack.unshift(preMatch);
                }
            }
            else
            {
                openMarks = "";
                closeMarks = closeMarks.substr(0, (-markDiff));
            }

            newText = openMarks + newText + closeMarks;

            //It is important to trim close marks to exclude whitespace out of syntax.
            text = KARAS.removeAndInsertText(text,
                                             preMatch.index,
                                             KARAS.indexOfMatchGroup(match, mgiAllText)
                                             + match[mgiAllText].trim().length
                                             - preMatch.index,
                                             newText);
            nextMatchIndex = preMatch.index + newText.length - closeMarks.length;
            KARAS.RegexPlugin.lastIndex = nextMatchIndex;
        }

        return text;
    };

    KARAS.constructPluginText = function(text, markedupText, openMarks, closeMarks)
    {
        var splitResult = KARAS.splitOptions(markedupText, false);
        var hasSpecialOption = splitResult.hasSpecialOption;
        var markedupTexts = splitResult.options;
        var markedupText = null;
        var pluginName = markedupTexts[0];
        var options = new Array();

        //Remove plugin name from option.
        if (markedupTexts.length > 1)
        {
            options = markedupTexts.slice(1);
        }

        if(hasSpecialOption == true)
        {
            markedupText = options.pop();
        }

        if (openMarks.length > 2 && closeMarks.length > 2)
        {
            return constructActionTypePlugintText(pluginName, options, markedupText, text);
        }
        else
        {
            return constructConvertTypePluginText(pluginName, options, markedupText);
        }
    };

    function constructActionTypePlugintText(pluginName, options, markedupText, text)
    {
        try
        {
            return window["KARAS"][pluginName.toLowerCase()]["action"](options, markedupText, text);
        }
        catch(e)
        {
            return " Plugin \"" + pluginName + "\" has wrong. ";
        }
    }

    function constructConvertTypePluginText(pluginName, options, markedupText)
    {
        try
        {
            return window["KARAS"][pluginName.toLowerCase()]["convert"](options, markedupText);
        }
        catch(e)
        {
            return " Plugin \"" + pluginName + "\" has wrong. ";
        }
    }





    function BlockGroupMatch()
    {
        this.type = -1;
        this.index = -1;
        this.length = -1;
        this.option = "";
    }

    KARAS.convertBlockGroup = function(text, escapeCode)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiOpenMarks = 1;
        var mgiOption = 2;

        var match = null;
        var nextMatchIndex = 0;

        var matchStack = new Array();
        var unhandledGroupClose = null;
        var groupsInPreCodeKbdSamp = 0;

        while (true)
        {
            match = KARAS.RegexBlockGroup.exec(text);

            if (match == null)
            {
                if (groupsInPreCodeKbdSamp > 0 && unhandledGroupClose != null)
                {
                    match = unhandledGroupClose;
                    groupsInPreCodeKbdSamp = 0;
                }
                else
                {
                    break;
                }
            }

            if (match[mgiOpenMarks] != null)
            {
                var blockGroupMatch = constructBlockGroupMatch
                                        (KARAS.indexOfMatchGroup(match, mgiAllText),
                                         match[mgiAllText].length,
                                         match[mgiOption]);

                if (blockGroupMatch.type >= KARAS.BlockGroupTypePre)
                {
                    groupsInPreCodeKbdSamp += 1;

                    if (groupsInPreCodeKbdSamp == 1)
                    {
                        matchStack.unshift(blockGroupMatch);
                    }
                }
                else
                {
                    //if pre or code group is open.
                    if (groupsInPreCodeKbdSamp > 0)
                    {
                        groupsInPreCodeKbdSamp += 1;
                    }
                    else
                    {
                        matchStack.unshift(blockGroupMatch);
                    }
                }

                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexBlockGroup.lastIndex = nextMatchIndex;
                continue;
            }

            if (matchStack.length == 0)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexBlockGroup.lastIndex = nextMatchIndex;
                continue;
            }

            if (groupsInPreCodeKbdSamp > 1)
            {
                groupsInPreCodeKbdSamp -= 1;
                unhandledGroupClose = match;
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexBlockGroup.lastIndex = nextMatchIndex;
                continue;
            }

            var preMatch = matchStack.shift();
            var newOpenText = "";
            var newCloseText = "";
            var result = constructBlockGroupText(preMatch, newOpenText, newCloseText);
            newOpenText = result.newOpenText;
            newCloseText = result.newCloseText;

            //Note, it is important to exclude linebreak code.
            var markedutTextIndex = preMatch.index + preMatch.length + 1;
            var markedupText = text.substr
                (markedutTextIndex,
                 KARAS.indexOfMatchGroup(match, mgiAllText) - markedutTextIndex - 1);

            switch (preMatch.type)
            {
                case KARAS.BlockGroupTypeDetails:
                {
                    markedupText = convertFigcaptionSummary(markedupText, "summary");
                    break;
                }
                case KARAS.BlockGroupTypeFigure:
                {
                    markedupText = convertFigcaptionSummary(markedupText, "figcaption");
                    break;
                }
                case KARAS.BlockGroupTypePre:
                case KARAS.BlockGroupTypeCode:
                case KARAS.BlockGroupTypeKbd:
                case KARAS.BlockGroupTypeSamp:
                {
                    markedupText = KARAS.escapeHTMLSpecialCharacters(markedupText);
                    markedupText = markedupText.replace("\n", escapeCode + "\n" + escapeCode);
                    groupsInPreCodeKbdSamp = 0;
                    break;
                }
            }

            var newText = newOpenText + markedupText + newCloseText;
            text = KARAS.removeAndInsertText(text,
                                             preMatch.index,
                                             KARAS.indexOfMatchGroup(match, mgiAllText)
                                             + match[mgiAllText].length
                                             - preMatch.index,
                                             newText);
            nextMatchIndex = preMatch.index + newText.length;
            KARAS.RegexBlockGroup.lastIndex = nextMatchIndex;
        }

        return text;
    };

    function constructBlockGroupMatch(index, textLength, optionText)
    {
        var blockGroupMatch = new BlockGroupMatch();
        blockGroupMatch.index = index;
        blockGroupMatch.length = textLength;

        var options = KARAS.splitOptions(optionText, false).options;

        if (options.length > 0)
        {
            var groupType = options[0];
            blockGroupMatch.type = getGroupType(groupType);

            if (blockGroupMatch.type == KARAS.BlockGroupTypeUndefined)
            {
                blockGroupMatch.type = KARAS.BlockGroupTypeDiv;
                blockGroupMatch.option = groupType;
            }
        }

        if (options.length > 1)
        {
            blockGroupMatch.option = options[1];
        }

        return blockGroupMatch;
    }

    function getGroupType(groupTypeText)
    {
        for (var i = 0; i < KARAS.ReservedBlockGroupTypes.length; i += 1)
        {
            if (groupTypeText.toUpperCase() == KARAS.ReservedBlockGroupTypes[i].toUpperCase())
            {
                return i;
            }
        }

        return KARAS.BlockGroupTypeUndefined;
    }

    function constructBlockGroupText(groupOpen, newOpenText, newCloseText)
    {
        var result = new Object();
        result.newOpenText = newOpenText;
        result.newCloseText = "</" + KARAS.ReservedBlockGroupTypes[groupOpen.type] + ">";
        var optionText = "";

        if (groupOpen.option.length != 0)
        {
            optionText = " class=\"" + groupOpen.option + "\"";
        }

        result.newOpenText = "<" + KARAS.ReservedBlockGroupTypes[groupOpen.type] + optionText + ">";

        if (groupOpen.type >= KARAS.BlockGroupTypePre)
        {
            if (groupOpen.type >= KARAS.BlockGroupTypeCode)
            {
                result.newOpenText = "<pre" + optionText + ">" + result.newOpenText;
                result.newCloseText += "</pre>";
            }

            result.newOpenText = "\n" + result.newOpenText;
            result.newCloseText = result.newCloseText + "\n";
        }
        else
        {
            result.newOpenText = KARAS.encloseWithLinebreak(result.newOpenText) + "\n";
            result.newCloseText = "\n" + KARAS.encloseWithLinebreak(result.newCloseText);
        }

        return result;
    }

    function convertFigcaptionSummary(text, element)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarks = 1;
        var mgiMarkedupText = 2;
        var mgiBreaks = 3;

        var maxLevelOfHeading = 6;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexFigcaptionSummary.exec(text);

            if (match == null)
            {
                break;
            }

            var newText = "";
            var level = match[mgiMarks].length;

            if (level >= maxLevelOfHeading + 1)
            {
                newText = KARAS.encloseWithLinebreak("<hr>");
            }
            else
            {
                //Note, it is important to convert inline markups first,
                //to convert inline markup's options first.
                var markedupText = KARAS.convertInlineMarkup(match[mgiMarkedupText]);
                var markedupTexts = KARAS.splitOptions(markedupText, false).options;
                var id = "";

                if (markedupTexts.length > 1)
                {
                    id = " id=\"" + markedupTexts[1] + "\"";
                }

                newText = KARAS.encloseWithLinebreak("<" + element + id + ">"
                          + markedupTexts[0]
                          + "</" + element + ">");
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length;
            KARAS.RegexFigcaptionSummary.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiAllText),
                                             match[mgiAllText].length
                                             - match[mgiBreaks].length,
                                             KARAS.encloseWithLinebreak(newText));
        }

        return text;
    }

    function SequentialBlockquote()
    {
        this.level = -1;
        this.text = "";
    }

    KARAS.convertBlockquote = function(text, hasUnConvertedBlockquote, escapeCode)
    {
        //match group index.
        var mgiAllText = 0;

        var result = new Object();
        result.hasUnConvertedBlockquote = hasUnConvertedBlockquote;
        result.text = text;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexBlockquote.exec(result.text);

            if (match == null)
            {
                if (nextMatchIndex == 0)
                {
                    result.hasUnConvertedBlockquote = false;
                }
                else
                {
                    result.hasUnConvertedBlockquote = true;
                }

                break;
            }

            var sequentialBlockquotes = new Array();
            var indexOfBlockquoteStart = KARAS.indexOfMatchGroup(match, mgiAllText);
            var indexOfBlockquoteEnd = constructSequentialBlockquotes
                (result.text, indexOfBlockquoteStart, sequentialBlockquotes);

            var newText = constructBlockquoteText(sequentialBlockquotes);
            newText = KARAS.replaceTextInPreElement(newText, "\n", escapeCode + "\n" + escapeCode);
            newText = KARAS.encloseWithLinebreak(newText);
            nextMatchIndex = indexOfBlockquoteStart + newText.length;
            KARAS.RegexBlockquote.lastIndex = nextMatchIndex;
            result.text = KARAS.removeAndInsertText(result.text,
                                                    indexOfBlockquoteStart,
                                                    indexOfBlockquoteEnd - indexOfBlockquoteStart,
                                                    KARAS.encloseWithLinebreak(newText));
        }

        return result;
    };

    function constructSequentialBlockquotes(text, indexOfBlockquoteStart, blockquotes)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarks = 1;
        var mgiMarkedupText = 2;
        var mgiNextMarks = 3;
        var mgiBreaks = 4;

        var match = null;
        var nextMatchIndex = indexOfBlockquoteStart;
        KARAS.RegexBlockquote.lastIndex = indexOfBlockquoteStart;

        while (true)
        {
            match = KARAS.RegexBlockquote.exec(text);

            if (match == null)
            {
                break;
            }
            
            var level = match[mgiMarks].length;
            var markedupText = match[mgiMarkedupText];

            if (blockquotes.length == 0)
            {
                var sequentialBlockquote = new SequentialBlockquote();
                sequentialBlockquote.level = level;
                sequentialBlockquote.text = markedupText.trim();
                blockquotes.push(sequentialBlockquote);
            }
            else
            {
                var previousBlockquote = blockquotes[blockquotes.length - 1];
                var previousLevel = previousBlockquote.level;

                if (level != previousLevel)
                {
                    var sequentialBlockquote = new SequentialBlockquote();
                    sequentialBlockquote.level = level;
                    sequentialBlockquote.text = markedupText.trim();
                    blockquotes.push(sequentialBlockquote);
                }
                else
                {
                    if (previousBlockquote.text.length != 0)
                    {
                        previousBlockquote.text += "\n";
                    }

                    previousBlockquote.text += markedupText.trim();
                }
            }

            if (match[mgiNextMarks] == null)
            {
                return KARAS.indexOfMatchGroup(match, mgiAllText)
                       + match[mgiAllText].length
                       - ((match[mgiBreaks] == null) ? 0 : match[mgiBreaks].length);
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiNextMarks);
            KARAS.RegexBlockquote.lastIndex = nextMatchIndex;
        }

        return -1;
    }

    function constructBlockquoteText(sequentialBlockquotes)
    {
        var blockquoteText = "";

        for (var i = 0; i < sequentialBlockquotes[0].level; i += 1)
        {
            blockquoteText += "<blockquote>\n\n";
        }

        blockquoteText += sequentialBlockquotes[0].text;

        for (var i = 1; i < sequentialBlockquotes.length; i += 1)
        {
            var levelDiff = sequentialBlockquotes[i].level - sequentialBlockquotes[i - 1].level;

            if (levelDiff > 0)
            {
                for (var j = 0; j < levelDiff; j += 1)
                {
                    blockquoteText += "\n\n<blockquote>";
                }
            }
            else
            {
                for (var j = levelDiff; j < 0; j += 1)
                {
                    blockquoteText += "\n\n</blockquote>";
                }
            }

            blockquoteText += "\n\n" + sequentialBlockquotes[i].text;
        }

        for (var i = 0; i < sequentialBlockquotes[sequentialBlockquotes.length - 1].level; i += 1)
        {
            blockquoteText += "\n\n</blockquote>";
        }

        return blockquoteText;
    }





    KARAS.convertCommentOut = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiMarks = 2;

        var match = null;
        var nextMatchIndex = 0;
        var indexOfOpenMarks = 0;
        var markIsOpen = false;

        while (true)
        {
            match = KARAS.RegexCommentOut.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks) + 1;
                KARAS.RegexCommentOut.lastIndex = nextMatchIndex;
                continue;
            }

            if (markIsOpen == false)
            {
                markIsOpen = true;
                indexOfOpenMarks = KARAS.indexOfMatchGroup(match, mgiMarks);
                nextMatchIndex = indexOfOpenMarks + match[mgiMarks].length;
                KARAS.RegexCommentOut.lastIndex = nextMatchIndex;
                continue;
            }
                
            text = text.substr(0, indexOfOpenMarks)
                   + text.substr(indexOfOpenMarks
                                 + KARAS.indexOfMatchGroup(match, mgiAllText)
                                 + match[mgiAllText].length
                                 - indexOfOpenMarks);
            markIsOpen = false;
            nextMatchIndex = indexOfOpenMarks;
            KARAS.RegexCommentOut.lastIndex = nextMatchIndex;
        }

        return text;
    };

    KARAS.convertWhiteSpaceLine = function(text)
    {
        //match group index.
        var mgiAllText = 0;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexWhiteSpaceLine.exec(text);

            if (match == null)
            {
                break;
            }

            var newText = "\n";

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length;
            KARAS.RegexWhiteSpaceLine.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiAllText),
                                             match[mgiAllText].length,
                                             newText);
        }

        return text;
    };

    KARAS.convertProtocol = function(text)
    {
        //match group index.
        //var mgiAllText = 0
        var mgiMarks = 1;

        //menas ":" length. 
        var colonLength = 1;

        var match = null;
        var nextMatchIndex = 0;

        while(true)
        {
            match = KARAS.RegexProtocol.exec(text);

            if(match == null)
            {
                break;
            }

            var newText = "";

            for(var i = 0; i < match[mgiMarks].length; i +=1)
            {
                newText += "\\/";
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks)
                             + colonLength
                             + newText.length;
            KARAS.RegexProtocol.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiMarks) + colonLength,
                                             match[mgiMarks].length,
                                             newText);
        }

        return text;
    };

    function TableCell()
    {
        this.isCollSpanBlank = false;
        this.isRowSpanBlank = false;
        this.type = "";
        this.textAlign = "";
        this.text = "";
    }

    KARAS.convertTable = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiTableText = 1;
        var mgiBreaks = 2;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexTableBlock.exec(text);

            if (match == null)
            {
                break;
            }

            var cells = constructTableCells(match[mgiTableText]);
            var newText = constructTableText(cells);
            newText = KARAS.encloseWithLinebreak(newText);
            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length;
            KARAS.RegexTableBlock.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                       KARAS.indexOfMatchGroup(match, mgiAllText),
                                       match[mgiAllText].length
                                       - match[mgiBreaks].length,
                                       KARAS.encloseWithLinebreak(newText));
        }

        return text;
    };

    function constructTableCells(tableBlock)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiCellType = 2;
        var mgiTextAlign = 3;

        //like '||' or any other...
        var tableCellMarkLength = 2;

        var tableLines = tableBlock.split(/\n/);
        var cells = new Array();

        for (var i = 0; i < tableLines.length; i += 1)
        {
            var tableLine = tableLines[i];
            cells[i] = new Array();
            var match = null;
            var markedupText = "";
            var nextMatchIndex = 0;

            while (true)
            {
                match = KARAS.RegexTableCell.exec(tableLine);

                if (match == null)
                {
                    markedupText = tableLine.substr(nextMatchIndex);

                    if (cells[i].length > 0)
                    {
                        setTableCellTextAndBlank(cells[i][cells[i].length - 1], markedupText);
                    }

                    break;
                }

                if (match[mgiEscapes].length % 2 == 1)
                {
                    nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiCellType) + 1;
                    KARAS.RegexTableCell.lastIndex = nextMatchIndex;
                    continue;
                }

                var cell = new TableCell();
                setTableCellTypeAndAlign(cell, match[mgiCellType], match[mgiTextAlign]);
                markedupText = tableLine.substr
                    (nextMatchIndex, KARAS.indexOfMatchGroup(match, mgiAllText) - nextMatchIndex);

                if (cells[i].length > 0)
                {
                    setTableCellTextAndBlank(cells[i][cells[i].length - 1], markedupText);
                }

                cells[i].push(cell);
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + tableCellMarkLength;
                KARAS.RegexTableCell.lastIndex = nextMatchIndex;
            }
        }

        return cells;
    }

    function setTableCellTypeAndAlign(cell, cellTypeMark, textAlignMark)
    {
        if (cellTypeMark == "|")
        {
            cell.type = "td";
        }
        else
        {
            cell.type = "th";
        }

        switch (textAlignMark)
        {
            case ">":
                {
                    cell.textAlign = " style=\"text-align:right\"";
                    break;
                }
            case "<":
                {
                    cell.textAlign = " style=\"text-align:left\"";
                    break;
                }
            case "=":
                {
                    cell.textAlign = " style=\"text-align:center\"";
                    break;
                }
            default:
                {
                    cell.textAlign = "";
                    break;
                }
        }
    }

    function setTableCellTextAndBlank(cell, markedupText)
    {
        markedupText = markedupText.trim();

        switch (markedupText)
        {
            case "::":
                {
                    cell.isCollSpanBlank = true;
                    break;
                }
            case ":::":
                {
                    cell.isRowSpanBlank = true;
                    break;
                }
            default:
                {
                    cell.text = KARAS.convertInlineMarkup(markedupText);
                    break;
                }
        }
    }

    function constructTableText(cells)
    {
        var tableText = "<table>\n";

        for (var row = 0; row < cells.length; row += 1)
        {
            tableText += "<tr>";

            for (var column = 0; column < cells[row].length; column += 1)
            {
                var cell = cells[row][column];

                if (cell.isCollSpanBlank || cell.isRowSpanBlank)
                {
                    continue;
                }

                var columnBlank = countBlankColumn(cells, column, row);
                var rowBlank = countBlankRow(cells, column, row);
                var colspanText = "";
                var rowspanText = "";

                if (columnBlank > 1)
                {
                    colspanText = " colspan = \"" + columnBlank + "\"";
                }

                if (rowBlank > 1)
                {
                    rowspanText = " rowspan = \"" + rowBlank + "\"";
                }

                tableText += "<" + cell.type + colspanText + rowspanText + cell.textAlign + ">"
                             + cell.text
                             + "</" + cell.type + ">";
            }

            tableText += "</tr>\n";
        }

        tableText += "</table>";
        return tableText;
    }

    function countBlankColumn(cells, column, row)
    {
        var blank = 1;
        var rightColumn = column + 1;

        while (rightColumn < cells[row].length)
        {
            var rightCell = cells[row][rightColumn];

            if (rightCell.isCollSpanBlank)
            {
                blank += 1;
                rightColumn += 1;
            }
            else
            {
                break;
            }
        }

        return blank;
    }

    function countBlankRow(cells, column, row)
    {
        var blank = 1;
        var underRow = row + 1;

        while (underRow < cells.length)
        {
            //Note, sometimes there is no column in next row.
            if (column >= cells[underRow].length)
            {
                break;
            }

            var underCell = cells[underRow][column];

            if (underCell.isRowSpanBlank)
            {
                blank += 1;
                underRow += 1;
            }
            else
            {
                break;
            }
        }

        return blank;
    }

    function SequentialList()
    {
        this.type = false;
        this.level = -1;
        this.items = new Array();
    }

    KARAS.convertList = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        
        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexList.exec(text);

            if (match == null)
            {
                break;
            }

            var sequentialLists = new Array();
            var listStartIndex = KARAS.indexOfMatchGroup(match, mgiAllText);
            var listEndIndex = constructSequentialLists(text, listStartIndex, sequentialLists);

            var newText = constructListText(sequentialLists);
            newText = KARAS.encloseWithLinebreak(newText);
            nextMatchIndex = listStartIndex + newText.length;
            KARAS.RegexList.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             listStartIndex,
                                             listEndIndex - listStartIndex,
                                             KARAS.encloseWithLinebreak(newText));
        }

        return text;
    };

    function constructSequentialLists(text, indexOfListStart, sequentialLists)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarks = 1;
        var mgiMarkedupText = 2;
        var mgiNextMarks = 3;
        var mgiBreaks = 4;

        var match = null;
        var nextMatchIndex = indexOfListStart;
        KARAS.RegexList.lastIndex = nextMatchIndex;
        var levelDiff = 0;
        var previousLevel = 0;

        while (true)
        {
            match = KARAS.RegexList.exec(text);

            if (match == null)
            {
                break;
            }

            //Update
            levelDiff = match[mgiMarks].length - previousLevel;
            previousLevel = match[mgiMarks].length;

            //If start of the items. || If Level up or down.
            if (levelDiff != 0)
            {
                var sequentialList = new SequentialList();

                if (match[mgiMarks][match[mgiMarks].length - 1] == '-')
                {
                    sequentialList.type = KARAS.ListTypeUl;
                }
                //if  == '+'
                else
                {
                    sequentialList.type = KARAS.ListTypeOl;
                }

                sequentialList.level = match[mgiMarks].length;
                sequentialList.items.push(match[mgiMarkedupText]);
                sequentialLists.push(sequentialList);
            }   
             //if same Level.
            else
            {
                var previousSequentialList = sequentialLists[sequentialLists.length - 1];
                var listType = KARAS.ListTypeUl;

                if (match[mgiMarks][match[mgiMarks].length - 1] == '-')
                {
                    listType = KARAS.ListTypeUl;
                }
                //if == '+'
                else
                {
                    listType = KARAS.ListTypeOl;
                }

                if (listType != previousSequentialList.type)
                {
                    var sequentialList = new SequentialList();
                    sequentialList.type = listType;
                    sequentialList.level = match[mgiMarks].length;
                    sequentialList.items.push(match[mgiMarkedupText]);
                    sequentialLists.push(sequentialList);
                }
                //if same items type.
                else
                {
                    previousSequentialList.items.push(match[mgiMarkedupText]);
                }
            }

            if (match[mgiNextMarks] == null)
            {
                return KARAS.indexOfMatchGroup(match, mgiAllText)
                       + match[mgiAllText].length
                       - ((match[mgiBreaks] == null) ? 0 : match[mgiBreaks].length);
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiNextMarks);
            KARAS.RegexList.lastIndex = nextMatchIndex;
        }

        return -1;
    }

    function constructListText(sequentialLists)
    {
        // Key = Level, Value = isUL(true:ul, false:ol)
        var listTypeHash = constructListTypeHash(sequentialLists);
        var listText = "";

        listText += constructFirstSequentialListText(sequentialLists[0], listTypeHash);

        //Write later lists.
        var previousLevel = sequentialLists[0].level;

        for (var i = 1; i < sequentialLists.length; i += 1)
        {
            var sequentialList = sequentialLists[i];

            //If level up.
            if (previousLevel < sequentialList.level)
            {
                listText += constructUpLevelSequentialListText
                    (previousLevel, sequentialList, listTypeHash);
            }        
            //If level down.
            else if (previousLevel > sequentialList.level)
            {
                listText += constructDownLevelSequentialListText
                    (previousLevel, sequentialList, listTypeHash);
            }
            //If same level.(It means the list type is changed.)
            else
            {
                listText += constructSameLevelSequentialListText
                    (previousLevel, sequentialList, listTypeHash);
            }

            previousLevel = sequentialList.level;
        }

        listText += constructListCloseText(previousLevel, listTypeHash);

        return KARAS.encloseWithLinebreak(listText);
    }

    function constructListTypeHash(sequentialLists)
    {
        var listTypeHash = new Array();
        var maxLevel = 1;

        for(var i = 0; i < sequentialLists.length; i++)
        {
            if (maxLevel < sequentialLists[i].level)
            {
                maxLevel = sequentialLists[i].level;
            }

            if (listTypeHash[sequentialLists[i].level] == null)
            {
                listTypeHash[sequentialLists[i].level] = sequentialLists[i].type;
            }
        }

        //If there is undefined level,
        //set the list type of the next higher defined level to it.
        //Note, the maximum level always has level type. 
        for (var level = 1; level < maxLevel; level += 1)
        {
            if (listTypeHash[level] == null)
            {
                var typeUndefinedLevels = new Array();
                typeUndefinedLevels.push(level);

                for (var nextLevel = level + 1; nextLevel <= maxLevel; nextLevel += 1)
                {
                    if (listTypeHash[nextLevel] != null)
                    {
                        for(var i = 0; i < typeUndefinedLevels.length; i++)
                        {
                            listTypeHash[typeUndefinedLevels[i]] = listTypeHash[nextLevel];
                        }

                        //Skip initialized level.
                        level = nextLevel + 1;
                        break;
                    }

                    typeUndefinedLevels.push(nextLevel);
                }
            }
        }

        return listTypeHash;
    }

    function constructFirstSequentialListText(sequentialList, listTypeHash)
    {
        var listText = "";

        for (var level = 1; level < sequentialList.level; level += 1)
        {
            if (listTypeHash[level] == KARAS.ListTypeUl)
            {
                listText += "<ul>\n<li>\n";
            }
            else
            {
                listText += "<ol>\n<li>\n";
            }
        }

        if (sequentialList.type == KARAS.ListTypeUl)
        {
            listText += "<ul>\n<li";
        }
        else
        {
            listText += "<ol>\n<li";
        }

        for (var i = 0; i < sequentialList.items.length - 1; i += 1)
        {
            listText += constructListItemText(sequentialList.items[i]) + "</li>\n<li";
        }

        listText += constructListItemText(sequentialList.items[sequentialList.items.length - 1]);

        return listText;
    }

    function constructUpLevelSequentialListText(previousLevel, sequentialList, listTypeHash)
    {
        var listText = "";

        for (var level = previousLevel; level < sequentialList.level - 1; level += 1)
        {
            if (listTypeHash[level] == KARAS.ListTypeUl)
            {
                listText += "\n<ul>\n<li>";
            }
            else
            {
                listText += "\n<ol>\n<li>";
            }
        }

        if (sequentialList.level != 1)
        {
            listText += "\n";
        }

        if (sequentialList.type == KARAS.ListTypeUl)
        {
            listText += "<ul>\n<li";
        }
        else
        {
            listText += "<ol>\n<li";
        }

        for (var i = 0; i < sequentialList.items.length - 1; i += 1)
        {
            listText += constructListItemText(sequentialList.items[i]) + "</li>\n<li";
        }

        listText += constructListItemText(sequentialList.items[sequentialList.items.length - 1]);

        return listText;
    }

    function constructDownLevelSequentialListText(previousLevel, sequentialList, listTypeHash)
    {
        //Close previous list item.
        var listText = "</li>\n";

        //Close previous level lists.
        for (var level = previousLevel; level > sequentialList.level; level -= 1)
        {
            if (listTypeHash[level] == KARAS.ListTypeUl)
            {
                listText += "</ul>\n";
            }
            else
            {
                listText += "</ol>\n";
            }

            listText += "</li>\n";
        }

        //if current level's list type is different from previous same level's list type.
        if (listTypeHash[sequentialList.level] != sequentialList.type)
        {
            //Note, it is important to update hash.
            if (listTypeHash[sequentialList.level] == KARAS.ListTypeUl)
            {
                listText += "</ul>\n<ol>\n";
                listTypeHash[sequentialList.level] = KARAS.ListTypeOl;
            }
            else
            {
                listText += "</ol>\n<ul>\n";
                listTypeHash[sequentialList.level] = KARAS.ListTypeUl;
            }
        }

        for (var i = 0; i < sequentialList.items.length - 1; i += 1)
        {
            listText += "<li" + constructListItemText(sequentialList.items[i]) + "</li>\n";
        }

        listText += "<li"
                    + constructListItemText(sequentialList.items[sequentialList.items.length - 1]);

        return listText;
    }

    function constructSameLevelSequentialListText(previousLevel, sequentialList, listTypeHash)
    {
        //Close previous list item.
        var listText = "";

        if (listTypeHash[previousLevel] == KARAS.ListTypeUl)
        {
            listText += "</li>\n</ul>\n";
        }
        else
        {
            listText += "</li>\n</ol>\n";
        }

        if (sequentialList.type == KARAS.ListTypeUl)
        {
            listText += "<ul>\n";
        }
        else
        {
            listText += "<ol>\n";
        }

        for (var i = 0; i < sequentialList.items.length - 1; i += 1)
        {
            listText += "<li" + constructListItemText(sequentialList.items[i]) + "</li>\n";
        }

        listText += "<li"
                    + constructListItemText(sequentialList.items[sequentialList.items.length - 1]);

        //Note, it is important to update hash.
        listTypeHash[sequentialList.level] = sequentialList.type;

        return listText;
    }

    function constructListItemText(listItemText)
    {
        listItemText = KARAS.convertInlineMarkup(listItemText);
        var listItemTexts = KARAS.splitOption(listItemText, false).options;

        if (listItemTexts.length > 1)
        {
            listItemText = " value=\"" + listItemTexts[1] + "\">";
        }
        else
        {
            listItemText = ">";
        }

        listItemText += listItemTexts[0];

        return listItemText;
    }

    function constructListCloseText(previousLevel, listTypeHash)
    {
        //Close previous list item.
        var listText = "</li>\n";

        //Close all.
        for (var level = previousLevel; level > 1; level -= 1)
        {
            if (listTypeHash[level] == KARAS.ListTypeUl)
            {
                listText += "</ul>\n";
            }
            else
            {
                listText += "</ol>\n";
            }

            listText += "</li>\n";
        }

        if (listTypeHash[1] == KARAS.ListTypeUl)
        {
            listText += "</ul>";
        }
        else
        {
            listText += "</ol>";
        }

        return listText;
    }

    KARAS.convertDefList = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarks = 1;
        var mgiMarkedupText = 2;
        var mgiNextMarks = 3;
        var mgiBreaks = 4;

        var match = null;
        var nextMatchIndex = 0;
        var indexOfDefListText = 0;
        var defListIsOpen = false;
        var newText = "";

        while (true)
        {
            match = KARAS.RegexDefList.exec(text);

            if (match == null)
            {
                break;
            }

            if (defListIsOpen == false)
            {
                defListIsOpen = true;
                indexOfDefListText = KARAS.indexOfMatchGroup(match, mgiAllText);
                newText = "<dl>\n";
            }

            if (match[mgiMarks].length == 1)
            {
                newText += "<dt>"
                           + KARAS.convertInlineMarkup(match[mgiMarkedupText].trim())
                           + "</dt>\n";
            }
            else
            {
                newText += "<dd>"
                           + KARAS.convertInlineMarkup(match[mgiMarkedupText].trim())
                           + "</dd>\n";
            }

            if (match[mgiNextMarks] == null)
            {
                newText = KARAS.encloseWithLinebreak(newText + "</dl>");
                nextMatchIndex = indexOfDefListText + newText.length;
                KARAS.RegexDefList.lastIndex = nextMatchIndex;
                text = KARAS.removeAndInsertText
                            (text,
                             indexOfDefListText,
                             KARAS.indexOfMatchGroup(match, mgiAllText)
                             + match[mgiAllText].length
                             - ((match[mgiBreaks] == null) ? 0 : match[mgiBreaks].length)
                             - indexOfDefListText,
                             KARAS.encloseWithLinebreak(newText));
                indexOfDefListText = 0;
                defListIsOpen = false;
                newText = "";
                continue;
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiNextMarks);
            KARAS.RegexDefList.lastIndex = nextMatchIndex;
        }

        return text;
    };

    KARAS.convertHeading = function(text, startLevelOfHeading)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarks = 1;
        var mgiMarkedupText = 2;
        var mgiBreaks = 3;

        var maxLevelOfHeading = 6;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexHeading.exec(text);

            if (match == null)
            {
                break;
            }

            var newText = "";
            var level = match[mgiMarks].length;
            level = level + startLevelOfHeading - 1;

            if (level >= maxLevelOfHeading + 1)
            {
                newText = KARAS.encloseWithLinebreak("<hr>");
            }
            else
            {
                //Note, it is important to convert inline markups first,
                //to convert inline markup's options first.
                var markedupText = KARAS.convertInlineMarkup(match[mgiMarkedupText]);
                var markedupTexts = KARAS.splitOption(markedupText, false).options;
                var id = "";

                if (markedupTexts.length > 1)
                {
                    id = " id=\"" + markedupTexts[1] + "\"";
                }

                newText = "<h" + level + id + ">" + markedupTexts[0] + "</h" + level + ">";
                newText = KARAS.encloseWithLinebreak(newText);
            }

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length;
            KARAS.RegexHeading.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiAllText),
                                             match[mgiAllText].length
                                             - match[mgiBreaks].length,
                                             KARAS.encloseWithLinebreak(newText));
        }

        return text;
    };

    KARAS.convertBlockLink = function(text)
    {
        //match group index.
        var mgiAllText = 0;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexBlockLink.exec(text);

            if (match == null)
            {
                break;
            }

            var newText = KARAS.convertInlineMarkup(match[mgiAllText]).trim();

            if (textIsParagraph(newText))
            {
                newText = "<p>" + newText + "</p>";
            }

            newText = KARAS.encloseWithLinebreak(newText);
            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length;
            KARAS.RegexBlockLink.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiAllText),
                                             match[mgiAllText].length,
                                             KARAS.encloseWithLinebreak(newText));
        }

        return text;
    };

    function textIsParagraph(text)
    {
        var restText = text.replace(KARAS.RegexLinkElement, "");
        restText = restText.trim();

        if (restText.length == 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    KARAS.convertParagraph = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiMarkedupText = 1;
        var mgiLTMarks = 2;

        //means \n\n length.
        var lineBreaks = 2;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexParagraph.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiLTMarks].length == 1)
            {
                //Note, it is important to exclude line breaks (like \n).
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText)
                                 + match[mgiMarkedupText].length;
                KARAS.RegexParagraph.lastIndex = nextMatchIndex;
                continue;
            }

            var markedupText = match[mgiMarkedupText].trim();

            if (markedupText.length == 0)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                continue;
            }

            var newText = "<p>" + KARAS.convertInlineMarkup(markedupText) + "</p>\n";
            newText = KARAS.encloseWithLinebreak(newText);
            nextMatchIndex = 
                KARAS.indexOfMatchGroup(match, mgiAllText) + newText.length - lineBreaks;
            KARAS.RegexParagraph.lastIndex = nextMatchIndex;
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiAllText),
                                             match[mgiAllText].length,
                                             newText);
        }

        return text;
    };

    KARAS.reduceBlankLine = function(text)
    {
        //match group index.
        var mgiLineBreakCode = 0;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexBlankLine.exec(text);

            if (match == null)
            {
                break;
            }

            text = text.substr(0, KARAS.indexOfMatchGroup(match, mgiLineBreakCode))
                   + text.substr(KARAS.indexOfMatchGroup(match, mgiLineBreakCode) 
                                 + match[mgiLineBreakCode].length);

            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiLineBreakCode);
            KARAS.RegexBlankLine.lastIndex = nextMatchIndex;
        }

        return text.trim();
    };

    KARAS.reduceEscape = function(text)
    {
        //match group index.
        var mgiEscapes = 0;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexEscape.exec(text);

            if (match == null)
            {
                break;
            }

            var reduceLength = Math.round((match[mgiEscapes].length) / 2);

            text = text.substr(0, KARAS.indexOfMatchGroup(match, mgiEscapes))
                   + text.substr(KARAS.indexOfMatchGroup(match, mgiEscapes) + reduceLength);
            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiEscapes)
                             + match[mgiEscapes].length
                             - reduceLength;
            KARAS.RegexEscape.lastIndex = nextMatchIndex;
        }

        return text;
    };





    function InlineMarkupMatch()
    {
        this.type = -1;
        this.index = -1;
        this.marks = "";
    }

    KARAS.convertInlineMarkup = function(text)
    {
        //match group index.
        //var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiMarks = 2;

        var matchStack = new Array();
        var match = null;
        var nextMatchIndex = 0;

        text = KARAS.convertLineBreak(text);

        while (true)
        {
            match = KARAS.RegexInlineMarkup.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiMarks) + 1;
                KARAS.RegexInlineMarkup.lastIndex = nextMatchIndex;
                continue;
            }

            var inlineMarkupMatch = constructInlineMarkupMatch
                (KARAS.indexOfMatchGroup(match, mgiMarks), match[mgiMarks]);
            var preMatch = null;
            var newText = "";
            var closeMarks = "";

            if (inlineMarkupMatch.type >= KARAS.InlineMarkupTypeLinkOpen)
            {
                //InlieneMarkupType*Close - 1 = InlineMarkupType*Open
                preMatch = getPreMatchedInlineMarkup(matchStack, inlineMarkupMatch.type - 1);
                var result = handleLinkAndInlineGroupMatch(text,
                                                           preMatch,
                                                           inlineMarkupMatch,
                                                           matchStack,
                                                           nextMatchIndex,
                                                           newText,
                                                           closeMarks);
                nextMatchIndex = result.nextMatchIndex;
                KARAS.RegexInlineMarkup.lastIndex = nextMatchIndex;
                newText = result.newText;
                closeMarks = result.closeMarks;

                if (nextMatchIndex != -1)
                {
                    continue;
                }
            }
            else
            {
                preMatch = getPreMatchedInlineMarkup(matchStack, inlineMarkupMatch.type);
                var result = handleBasicInlineMarkupMatch(text,
                                                          preMatch,
                                                          inlineMarkupMatch,
                                                          matchStack,
                                                          nextMatchIndex,
                                                          newText,
                                                          closeMarks);
                nextMatchIndex = result.nextMatchIndex;
                KARAS.RegexInlineMarkup.lastIndex = nextMatchIndex;
                newText = result.newText;
                closeMarks = result.closeMarks;

                if (nextMatchIndex != -1)
                {
                    continue;
                }
            }

            //It is important to trim close marks to exclude whitespace out of syntax.
            text = KARAS.removeAndInsertText(text,
                                             preMatch.index,
                                             inlineMarkupMatch.index
                                             + inlineMarkupMatch.marks.trim().length
                                             - preMatch.index,
                                             newText);
            nextMatchIndex = preMatch.index + newText.length - closeMarks.length;
            KARAS.RegexInlineMarkup.lastIndex = nextMatchIndex;
        }

        return text;
    };

    KARAS.convertLineBreak = function(text)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiEscapes = 1;
        var mgiLineBreak = 2;

        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexLineBreak.exec(text);

            if (match == null)
            {
                break;
            }

            if (match[mgiEscapes].length % 2 == 1)
            {
                nextMatchIndex = 
                    KARAS.indexOfMatchGroup(match, mgiAllText) + match[mgiAllText].length;
                KARAS.RegexLineBreak.lastIndex = nextMatchIndex;
                continue;
            }

            var newText = "<br>\n";
            text = KARAS.removeAndInsertText(text,
                                             KARAS.indexOfMatchGroup(match, mgiLineBreak),
                                             match[mgiLineBreak].length,
                                             newText);
            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiLineBreak) + newText.length;
            KARAS.RegexLineBreak.lastIndex = nextMatchIndex;
        }

        return text;
    };

    function constructInlineMarkupMatch(index, marks)
    {
        var inlineMarkupMatch = new InlineMarkupMatch();

        for (var i = 0; i < KARAS.InlineMarkupSets.length; i += 1)
        {
            if (marks[0] == KARAS.InlineMarkupSets[i][0][0])
            {
                inlineMarkupMatch.type = i;
                inlineMarkupMatch.index = index;
                inlineMarkupMatch.marks = marks;
                break;
            }
        }

        return inlineMarkupMatch;
    }

    function handleLinkAndInlineGroupMatch
        (text, openMatch, closeMatch, matchStack, nextMatchIndex, newText, closeMarks)
    {
        var result = new Object();

        if (closeMatch.type == KARAS.InlineMarkupTypeLinkOpen
            || closeMatch.type == KARAS.InlineMarkupTypeInlineGroupOpen)
        {
            matchStack.unshift(closeMatch);
            result.nextMatchIndex = closeMatch.index + closeMatch.marks.length;
            result.newText = newText;
            result.closeMarks = closeMarks;
            return result;
        }

        if (openMatch == null)
        {
            result.nextMatchIndex = closeMatch.index + closeMatch.marks.length;
            result.newText = newText;
            result.closeMarks = closeMarks;
            return result;
        }

        var markedupTextIndex = openMatch.index + openMatch.marks.length;
        var markedupText = text.substr(markedupTextIndex, closeMatch.index - markedupTextIndex);
        var openMarks = KARAS.removeWhiteSpace(openMatch.marks);
        result.closeMarks = KARAS.removeWhiteSpace(closeMatch.marks);

        if (closeMatch.type == KARAS.InlineMarkupTypeLinkClose)
        {
            var constructResult = constructLinkText
                (markedupText, newText, openMarks, result.closeMarks);

            result.newText = constructResult.newText;
            openMarks = constructResult.openMarks;
            result.closeMarks = constructResult.closeMarks;
        }
        else
        {
            var constructResult = constructInlineGroupText
                (markedupText, newText, openMarks, result.closeMarks);

            result.newText = constructResult.newText;
            openMarks = constructResult.openMarks;
            result.closeMarks = constructResult.closeMarks;
        }

        if (openMarks.length > 1)
        {
            openMatch.marks = openMarks;
        }
        else
        {
            while (true)
            {
                if (matchStack.shift().type == openMatch.type)
                    break;
            }
        }

        result.nextMatchIndex = -1;
        return result;
    }

    function handleBasicInlineMarkupMatch
        (text, openMatch, closeMatch, matchStack, nextMatchIndex, newText, closeMarks)
    {
        var result = new Object();

        if (openMatch == null)
        {
            matchStack.unshift(closeMatch);
            result.nextMatchIndex = closeMatch.index + closeMatch.marks.length;
            result.newText = newText;
            result.closeMarks = closeMarks;
            return result;
        }

        var markedupTextIndex = openMatch.index + openMatch.marks.length;
        var markedupText = text.substr
            (markedupTextIndex, closeMatch.index - markedupTextIndex).trim();

        if (openMatch.type <= KARAS.InlineMarkupTypeSupRuby
            && openMatch.marks.length >= 3 && closeMatch.marks.length >= 3)
        {
            var constructResult = constructSecondInlineMarkupText
                (markedupText, openMatch, closeMatch, newText, closeMarks);

            result.newText = constructResult.newText;
            result.closeMarks = constructResult.closeMarks;
        }
        else
        {
            var constructResult = constructFirstInlineMarkupText
                (markedupText, openMatch, closeMatch, newText, closeMarks);

            result.newText = constructResult.newText;
            result.closeMarks = constructResult.closeMarks;
        }

        while (true)
        {
            if (matchStack.shift().type == closeMatch.type)
            {
                break;
            }
        }

        result.nextMatchIndex = -1;
        return result;
    }

    function getPreMatchedInlineMarkup(matchStack, inlineMarkupType)
    {
        //Note, check from latest match.
        for (var i = 0; i < matchStack.length; i += 1)
        {
            if (matchStack[i].type == inlineMarkupType)
            {
                return matchStack[i];
            }
        }

        return null;
    }

    function constructLinkText(markedupText, newText, openMarks, closeMarks)
    {
        var result = new Object();
        var markedupTexts = KARAS.splitOption(markedupText, false).options;
        var url = markedupTexts[0];

        if (openMarks.length >= 5 && closeMarks.length >= 5)
        {
            result.newText = "<a href=\"" + url + "\">"
                             + constructMediaText(url, markedupTexts) + "</a>";
        }
        else if (openMarks.length >= 3 && closeMarks.length >= 3)
        {
            result.newText = constructMediaText(url, markedupTexts);
        }
        else
        {
            var aliasText = "";

            if (markedupTexts.length > 1)
            {
                aliasText = markedupTexts[1];
            }
            else
            {
                aliasText = url;
            }

            result.newText = "<a href=\"" + url + "\">" + aliasText + "</a>";
        }

        var markDiff = openMarks.length - closeMarks.length;

        if (markDiff > 0)
        {
            result.openMarks = openMarks.substr(0, markDiff);
            result.closeMarks = "";
        }
        else
        {
            result.openMarks = "";
            result.closeMarks = closeMarks.substr(0, (-markDiff));
        }

        result.newText = result.openMarks + result.newText + result.closeMarks;

        return result;
    }

    function constructMediaText(url, markedupTexts)
    {
        var mediaText = "";
        var option = "";
        var reservedAttribute = "";
        var otherAttribute = "";
        var embedAttribute = "";
        var mediaType = KARAS.getMediaType(KARAS.getFileExtension(url));

        if (markedupTexts.length > 1)
        {
            option = markedupTexts[1];
            var result = constructObjectAndEmbedAttributes
                (option, reservedAttribute, otherAttribute, embedAttribute);
            reservedAttribute = result.reservedAttribute;
            otherAttribute = result.otherAttribute;
            embedAttribute = result.embedAttribute;
            option = " " + markedupTexts[1];
        }

        switch (mediaType)
        {
            case KARAS.MediaTypeImage:
                {
                    mediaText = "<img src=\"" + url + "\"" + option + ">";
                    break;
                }
            case KARAS.MediaTypeAudio:
                {
                    mediaText = "<audio src=\"" + url + "\"" + option + ">"
                                + "<object data=\"" + url + "\"" + reservedAttribute + ">"
                                + otherAttribute
                                + "<embed src=\"" + url + "\"" + embedAttribute
                                + "></object></audio>";
                    break;
                }
            case KARAS.MediaTypeVideo:
                {
                    mediaText = "<video src=\"" + url + "\"" + option + ">"
                                + "<object data=\"" + url + "\"" + reservedAttribute + ">"
                                + otherAttribute
                                + "<embed src=\"" + url + "\"" + embedAttribute
                                + "></object></video>";
                    break;
                }
            default:
                {
                    mediaText = "<object data=\"" + url + "\"" + reservedAttribute + ">"
                                + otherAttribute
                                + "<embed src=\"" + url + "\"" + embedAttribute
                                + "></object>";
                    break;
                }
        }

        return mediaText;
    }

    KARAS.getMediaType = function(extension)
    {
        var match = null;

        for (var i = 0; i < KARAS.MediaExtensions.length; i += 1)
        {
            match = KARAS.MediaExtensions[i].exec(extension);

            if (match != null)
            {
                return i;
            }
        }

        return KARAS.MediaTypeUnknown;
    };

    KARAS.getFileExtension = function(text)
    {
        //match group index.
        //var mgiAllText = 0;
        var mgiFileExtension = 1;

        var match = KARAS.RegexFileExtension.exec(text);

        if (match != null)
        {
            return match[mgiFileExtension];
        }
        else
        {
            return "";
        }
    };

    function constructObjectAndEmbedAttributes
        (option, reservedAttribute, otherAttribute, embedAttribute)
    {
        var result = new Object();
        result.reservedAttribute = reservedAttribute;
        result.otherAttribute = otherAttribute;
        result.embedAttribute = embedAttribute;

        var parameterHash = constructParameterHash(option);
        var names = Object.keys(parameterHash);
        for(var i = 0; i < names.length; i++)
        {
            if (attributeIsReserved(names[i]))
            {
                result.reservedAttribute += names[i] + "=\"" + parameterHash[names[i]] + "\" ";
            }
            else
            {
                result.otherAttribute += "<param name=\"" + names[i]
                                         + "\" value=\"" + parameterHash[names[i]] + "\">";
            }

            result.embedAttribute += names[i] + "=\"" + parameterHash[names[i]] + "\" ";
        }

        if (result.reservedAttribute.length > 0)
        {
            result.reservedAttribute = " " + result.reservedAttribute.trim();
        }

        if (result.embedAttribute.length > 0)
        {
            result.embedAttribute = " " + result.embedAttribute.trim();
        }

        return result;
    }

    function constructParameterHash(option)
    {
        //match group index.
        var mgiAllText = 0;
        var mgiName = 1;
        var mgiValue = 2;

        var parameterHash = new Object();
        var match = null;
        var nextMatchIndex = 0;

        while (true)
        {
            match = KARAS.RegexStringTypeAttribute.exec(option);

            if (match == null)
            {
                break;
            }

            parameterHash[match[mgiName]] = match[mgiValue];

            option = option.substr(0, KARAS.indexOfMatchGroup(match, mgiAllText))
                     + option.substr(KARAS.indexOfMatchGroup(match, mgiAllText)
                                     + match[mgiAllText].length);
            nextMatchIndex = KARAS.indexOfMatchGroup(match, mgiAllText);
            KARAS.RegexStringTypeAttribute.lastIndex = nextMatchIndex;
        }

        var logicalValues = option.split(/\s/);

        for(var i = 0; i < logicalValues.length; i++)
        {
            if (logicalValues[i].length > 0)
            {
                parameterHash[logicalValues[i]] = "true";
            }
        }

        return parameterHash;
    }

    function attributeIsReserved(attribute)
    {
        for(var i = 0; i < KARAS.ReservedObjectAttributes.length; i++)
        {
            if (attribute.toUpperCase() == KARAS.ReservedObjectAttributes[i].toUpperCase())
            {
                return true;
            }
        }

        return false;
    }

    function constructInlineGroupText(markedupText, newText, openMarks, closeMarks)
    {
        var result = new Object();
        var markedupTexts = KARAS.splitOption(markedupText, false).options;
        var idClass = "";

        if (openMarks.length >= 3 && closeMarks.length >= 3)
        {
            idClass = " id=\"";
        }
        else
        {
            idClass = " class=\"";
        }

        if (markedupTexts[0].length == 0)
        {
            idClass = "";
        }
        else
        {
            idClass += markedupTexts[0] + "\""
        }

        if (markedupTexts.length > 1)
        {
            result.newText = markedupTexts[1];
        }
        else
        {
            result.newText = "";
        }

        var markDiff = openMarks.length - closeMarks.length;

        if (markDiff > 0)
        {
            result.openMarks = openMarks.substr(0, markDiff);
            result.closeMarks = "";
        }
        else
        {
            result.openMarks = "";
            result.closeMarks = closeMarks.substr(0, (-markDiff));
        }

        result.newText = result.openMarks + "<span" + idClass + ">"
                         + result.newText + "</span>" + result.closeMarks;
        return result;
    }

    function constructSecondInlineMarkupText
        (markedupText, openMatch, closeMatch, newText, closeMarks)
    {
        var result = new Object();
        var inlineMarkupSet = KARAS.InlineMarkupSets[openMatch.type];
        var openMarks = openMatch.marks.substr(3);
        result.closeMarks = closeMatch.marks.substr(3);
        var openTag = "";
        var closeTag = "";

        if (openMatch.type == KARAS.InlineMarkupTypeSupRuby)
        {
            openTag = "<ruby>";
            closeTag = "</ruby>";
            var markedupTexts = KARAS.splitOptions(markedupText, false).options;
            markedupText = markedupTexts[0];

            for (var i = 1; i < markedupTexts.length; i += 2)
            {
                markedupText += "<rp> (</rp><rt>" + markedupTexts[i] + "</rt><rp>) </rp>";

                if (i + 1 < markedupTexts.length)
                {
                    markedupText += markedupTexts[i + 1];
                }
            }
        }
        else
        {
            openTag = "<" + inlineMarkupSet[2] + ">";
            closeTag = "</" + inlineMarkupSet[2] + ">";

            if (openMatch.type == KARAS.InlineMarkupTypeDefAbbr)
            {
                openTag = "<" + inlineMarkupSet[1] + ">" + openTag;
                closeTag = closeTag + "</" + inlineMarkupSet[1] + ">";
            }

            if (openMatch.type == KARAS.InlineMarkupKbdSamp
                || openMatch.type == KARAS.InlineMarkupVarCode)
            {
                markedupText = KARAS.escapeHTMLSpecialCharacters(markedupText);
            }
        }

        result.newText = openMarks + openTag + markedupText + closeTag + result.closeMarks;
        return result;
    }

    function constructFirstInlineMarkupText
        (markedupText, openMatch, closeMatch, newText, closeMarks)
    {
        var result = new Object();
        var inlineMarkupSet = KARAS.InlineMarkupSets[openMatch.type];
        var openMarks = openMatch.marks.substr(2);
        result.closeMarks = closeMatch.marks.substr(2);
        var openTag = "<" + inlineMarkupSet[1] + ">";
        var closeTag = "</" + inlineMarkupSet[1] + ">";

        if (openMatch.type == KARAS.InlineMarkupVarCode
            || openMatch.type == KARAS.InlineMarkupKbdSamp)
        {
            markedupText = KARAS.escapeHTMLSpecialCharacters(markedupText);
        }
        
        result.newText = openMarks + openTag + markedupText + closeTag + result.closeMarks;
        return result;
    }

})()