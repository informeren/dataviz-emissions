#!/usr/bin/perl

=pod

=encoding utf8

=head1 NAME

options.pl - Generate a list of <option> elements for selecting municipalities.

=head1 SYNOPSIS

options.pl

=head1 DESCRIPTION

=cut

use strict;
use warnings;

print "<option value=\"all\">Alle</option>\n";
while (<DATA>) {
  chomp;
  my ($municipality, $id) = split /:/;
  print "<option value=\"$id\">$municipality</option>\n";
}

=pod

=head1 AUTHOR

Morten Wulff, <wulff@ratatosk.net>

=head1 COPYRIGHT

Copyright (c) 2014, Morten Wulff
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

=cut

__DATA__
Aabenraa:580
Aalborg:851
Aarhus:751
Albertslund:165
Allerød:201
Assens:420
Ballerup:151
Billund:530
Bornholm:400
Brøndby:153
Brønderslev:810
Dragør:155
Egedal:240
Esbjerg:561
Faaborg-Midtfyn:430
Fanø:563
Favrskov:710
Faxe:320
Fredensborg:210
Fredericia:607
Frederiksberg:147
Frederikshavn:813
Frederikssund:250
Furesø:190
Gentofte:157
Gladsaxe:159
Glostrup:161
Greve:253
Gribskov:270
Guldborgsund:376
Haderslev:510
Halsnæs:260
Hedensted:766
Helsingør:217
Herlev:163
Herning:657
Hillerød:219
Hjørring:860
Holbæk:316
Holstebro:661
Horsens:615
Hvidovre:167
Høje-Taastrup:169
Hørsholm:223
Ikast-Brande:756
Ishøj:183
Jammerbugt:849
Kalundborg:326
Kerteminde:440
Kolding:621
København:101
Køge:259
Langeland:482
Lejre:350
Lemvig:665
Lolland:360
Lyngby-Taarbæk:173
Læsø:825
Mariagerfjord:846
Middelfart:410
Morsø:773
Norddjurs:707
Nordfyns:480
Nyborg:450
Næstved:370
Odder:727
Odense:461
Odsherred:306
Randers:730
Rebild:840
Ringkøbing-Skjern:760
Ringsted:329
Roskilde:265
Rudersdal:230
Rødovre:175
Samsø:741
Silkeborg:740
Skanderborg:746
Skive:779
Slagelse:329
Solrød:269
Sorø:340
Stevns:336
Struer:671
Svendborg:479
Syddjurs:706
Sønderborg:540
Thisted:787
Tårnby:185
Tønder:550
Vallensbæk:187
Varde:573
Vejen:575
Vejle:630
Vesthimmerlands:793
Viborg:791
Vordingborg:390
Ærø:492
