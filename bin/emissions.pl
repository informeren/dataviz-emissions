#!/usr/bin/perl

=pod

=encoding utf8

=head1 NAME

emissions.pl - Convert CSV files to JSON files for use with D3

=head1 SYNOPSIS

emissions.pl -i INPUT_FILE -o OUTPUT_DIRECTORY -t type

=head1 DESCRIPTION

This script lets you convert CSV reports from Region Syddanmark's "Talbank" (see link below) to a hierarchical data structure in JSON format for use with libraries like D3.

=head2 Command-Line Options

The following invocation of the command reads the file "type.csv" and creates the output files in the "../data" directory. It expects the input to be ordered by emission type.

    emissions.pl -i type.csv -o ../data -t type

=over

=item -i INPUT_FILE

The absolute or relative path to the input file. This file should contain the raw output which you downloaded from the "Talbank.

=item -o OUTPUT_DIRECTORY

The absolute or relative path to the output directory. The script generates one .json file for each municipality as well as a file containing totals for all municipalities. Files are named using the official numeric municipality IDs.

=item -t TYPE

Which type of data to process. Valid values are "type", "source", and "industry". See the README file in the root of this project for more information.

=back

=cut

use strict;
use warnings;

use Data::Dumper;
use Getopt::Std;
use JSON;
use Pod::Usage;

# turn off output buffering
$|++;

# get command line options
my %opts = ();
getopts('i:o:t:', \%opts) or pod2usage(2);

# print usage instructions if required options are missing
if (!$opts{'i'} || !$opts{'o'} || !$opts{'t'}) {
  pod2usage(2);
}

# setup mapping between municipality name and its ID
my $municipalities = {};
while (<DATA>) {
  chomp;
  my ($municipality, $id) = split /:/;
  $municipalities->{$municipality} = $id;
}

# prepare the input file
open(my $input, '<', $opts{'i'}) or die "cannot open input file '$opts{'i'}': $!";

my @rows;
my $label1;
my $label2;
my $label3;

while (<$input>) {
  chomp;
  my @fields = split /;/;

  if ($#fields == 2) {
    $label1 = $fields[2];
  }
  if ($#fields == 3) {
    $label2 = $fields[3];
  }
  if ($#fields == 4) {
    $label3 = $fields[4];
  }

  my @count = grep /^\d+$/, @fields;
  if ($#count == 11) {
    @fields = splice @fields, -13;
    unshift @fields, $label3;
    unshift @fields, $label2;
    unshift @fields, $label1;
    push @rows, \@fields;
  }
}

close($input);

# tell the user how much work we have to do
my $count = @rows;
print "Processing $count lines...";

my $result = {};

SWITCH: {
  $opts{'t'} eq 'type'     && do { $result = parse_type(\@rows); last SWITCH; };
  $opts{'t'} eq 'source'   && do { $result = parse_source(\@rows); last SWITCH; };
  $opts{'t'} eq 'industry' && do { $result = parse_industry(\@rows); last SWITCH; };
}

foreach my $key (keys $result) {
  my $local = $result->{$key};

  my $output_file = $opts{'o'} . $key . '.json';
  open(my $fh, '>', $output_file) or die "cannot open output file '$output_file': $!";

  my $json = JSON->new;
  print $fh $json->pretty->encode($local);

  close $fh;
}

print " Done!\n";

sub parse_type {
  my $rows = shift;
  my $result = {};
  my $total = {};

  my $emission_map = {
    'CO2' => 'co2',
    'Lattergas' => 'no',
    'Methan' => 'ch4',
    'GWP (CO2-ækvivalenter)' => 'gwp',
  };

  while (my $row = shift @$rows) {
    for my $i (0..3) {
      $row->[$i] =~ s/"//g;
    }

    for my $i (0..11) {
      my $year = 2000 + $i;
      $result->{$municipalities->{$row->[3]}}->{$year}->{$emission_map->{$row->[2]}} += $row->[$i + 4];
      $total->{$year}->{$emission_map->{$row->[2]}} += $row->[$i + 4];
    }
  }

  $result->{'all'} = $total;

  return $result;
}

sub parse_source {
  my $rows = shift;
  my $result = {};
  my $total = {};

  my $emission_map = {
    'CO2' => 'co2',
    'Lattergas' => 'no',
    'Methan' => 'ch4',
    'GWP (CO2-ækvivalenter)' => 'gwp',
  };

  my $source_map = {
    'Fossile brændsler (olie, kul, gas)' => 'fossil_fuels',
    'Vedvarende energi' => 'renewables',
    'El' => 'electricity',
    'Fjernvarme' => 'districtheating',
    'Ikke-energirelateret udledning' => 'unrelated',
  };

  while (my $row = shift @$rows) {
    for my $i (0..3) {
      $row->[$i] =~ s/"//g;
    }

    for my $i (0..11) {
      my $year = 2000 + $i;
      $result->{$municipalities->{$row->[3]}}->{$year}->{$source_map->{$row->[1]}}->{$emission_map->{$row->[2]}} += $row->[$i + 4];
      $total->{$year}->{$source_map->{$row->[1]}}->{$emission_map->{$row->[2]}} += $row->[$i + 4];
    }
  }

  $result->{'all'} = $total;

  return $result;
}

sub parse_industry {
  my $rows = shift;
  my $result = {};
  my $total = {};

  my $emission_map = {
    'CO2' => 'co2',
    'Lattergas' => 'no',
    'Methan' => 'ch4',
    'GWP (CO2-ækvivalenter)' => 'gwp',
  };

  my $industry_map = {
    'Finansiering og forsikring' => 'finance',
    'Landbrug, skovbrug og fiskeri' => 'agriculture',
    'Industri' => 'industry',
    'Off. adm, undervisn., sundhed' => 'government',
    'Ufordelt udledning' => 'other',
    'Handel og transport mv.' => 'transport',
    'Ejend.hand.,udl.af erhv.ejend.' => 'real_estate',
    'Kultur, fritid, anden service' => 'culture',
    'Husholdninger' => 'households',
    'Erhvervsservice' => 'service',
    'Boliger' => 'accomodation',
    'Råstofindvinding' => 'raw_materials',
    'Information og kommunikation' => 'communication',
    'Bygge og anlæg' => 'construction',
    'Forsyningsvirksomhed' => 'utilities',
  };

  while (my $row = shift @$rows) {
    for my $i (0..3) {
      $row->[$i] =~ s/"//g;
    }

    for my $i (0..11) {
      my $year = 2000 + $i;
      $result->{$municipalities->{$row->[3]}}->{$year}->{$industry_map->{$row->[2]}}->{$emission_map->{$row->[0]}} += $row->[$i + 4];
      $total->{$year}->{$industry_map->{$row->[2]}}->{$emission_map->{$row->[0]}} += $row->[$i + 4];
    }
  }

  $result->{'all'} = $total;

  return $result;
}

=pod

=head1 LINKS

http://www.detgodeliv.regionsyddanmark.dk/talbank/talbank

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
