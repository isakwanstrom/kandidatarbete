<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" doctype-public="XSLT-compat" omit-xml-declaration="yes" indent="yes"/>

<!-- Root template -->
<xsl:template match="/">
    <html>
        <head>
            <title>Regelbok Online</title>
            <link rel="stylesheet" href="style.css"/>
            <script src="script.js"></script>
        </head>
        <body>
            <h1>Regelbok - Att vända strömmen</h1>
            <ul>
                <xsl:apply-templates select="regelbok/rubrik"/>
            </ul>
        </body>
    </html>
</xsl:template>
<xsl:template match="p">
    <p>
        <xsl:apply-templates/> <!-- Detta säkerställer att all innehåll inom <p> behandlas, inklusive <img> -->
    </p>
</xsl:template>

<xsl:template match="img">
    <p>
        <img src="{@src}" alt="{@alt}"/>
    </p>
</xsl:template>




<!-- Template for each 'rubrik' element -->
<xsl:template match="rubrik">
    <li>
        <!-- Korrekt att skapa ID genom att ersätta punkter i namnet och lägga till en prefix -->
        <a href="javascript:void(0);" class="heading1">
            <xsl:value-of select="@namn"/>
        </a>
        <div class="content" style="display:none;">
            <!-- Hämta och behandla rubriktexten -->
            <xsl:apply-templates select="text[@klass='rubriktext']"/>
            <!-- Visa underrubrikerna efter rubriktexten -->
            <xsl:apply-templates select="underrubrik"/>
            <!-- Visa bilder som kan vara direkt under en rubrik -->
            <xsl:apply-templates select="img"/>
        </div>
    </li>
</xsl:template>



<xsl:template match="text[@klass='info']">
    <p>
        <xsl:apply-templates select="node()"/> <!-- This processes img tags and text nodes within text -->
    </p>
</xsl:template>


<!-- Template for text directly under a 'rubrik' with class "rubriktext" -->
<xsl:template match="rubrik/text[@klass='rubriktext']">
    <li class="rubriktext">
        <div class="content" style="display:block;">
            <xsl:value-of select="."/> <!-- Hämta värdet av den aktuella textnoden -->
        </div>
    </li>
</xsl:template>


<!-- Template for each 'underrubrik' element -->
<xsl:template match="underrubrik">
    <li>
        <a href="javascript:void(0);" class="heading2">
            <xsl:value-of select="@namn"/>
        </a>
        <div class="content" style="display:none;">
            <xsl:apply-templates select="text[@klass='info']"/>
            <!-- Apply templates for sub-underrubrik elements -->
            <ul>
                <xsl:apply-templates select="underrubrik"/>
                <xsl:apply-templates select="img"/>
            </ul>
        </div>
    </li>
</xsl:template>

<!-- Template for each 'underrubrik' element (heading 3) -->
<xsl:template match="underrubrik[@klass='heading3']">
    <li>
        <a href="javascript:void(0);" class="heading3">
            <xsl:value-of select="@namn"/>
        </a>
        <div class="content" style="display:none;">
            <xsl:apply-templates select="text[@klass='info']"/>
            <xsl:apply-templates select="img"/>
        </div>
    </li>
</xsl:template>


<!-- Template for text elements with class "info" -->
<xsl:template match="text[@klass='info']">
    <p>
        <!-- Dela texten vid kolon, men bara om det inte förekommer någon punkt före kolonet -->
        <xsl:variable name="firstSentence" select="substring-before(concat(., '.'), '.')" />
        <xsl:choose>
            <xsl:when test="contains($firstSentence, ':') and not(contains(substring-before($firstSentence, ':'), '.'))">
                <!-- Fetstil texten före kolonet -->
                <strong>
                    <xsl:value-of select="substring-before($firstSentence, ':')" />
                </strong>
                <!-- Lägg till kolonet och resten av texten -->
                <xsl:text>:</xsl:text>
                <xsl:value-of select="substring-after($firstSentence, ':')" />
                <!-- Lägg till resten av meningen efter första meningen om det finns något kvar -->
                <xsl:if test="string-length($firstSentence) != string-length(.)">
                    <xsl:value-of select="substring(substring-after(., $firstSentence), 2)" />
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <!-- Skriv ut hela texten om det inte finns något kolon -->
                <xsl:value-of select="." />
            </xsl:otherwise>
        </xsl:choose>
        <xsl:apply-templates select="img"/>
    </p>
</xsl:template>

<xsl:template match="p">
    <p>
        <xsl:apply-templates/> <!-- Processar både text och img-taggar -->
    </p>
</xsl:template>


</xsl:stylesheet>
